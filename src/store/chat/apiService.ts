import { apiMethods, getAuthToken } from "@services/API/apiMethods";
import { Logger } from "@utils/logger";
import type { ChatStore } from "./chatStore";
import { createChannelFromAPI, transformToMessage } from "./transforms";
import type { APIChannel, RESTGetAPIMessageListQuery } from "@foxogram/api-types";

interface AuthError {
    response?: {
        status?: number;
    };
    code?: string;
}

function isAuthError(err: unknown): err is AuthError {
    return typeof err === "object" && err !== null && ("response" in err || "code" in err);
}

function handleAuthError(this: ChatStore, error: unknown) {
    if (isAuthError(error) && (error.response?.status === 401 || error.code === "UNAUTHORIZED")) {
        Logger.error(`Auth error: ${JSON.stringify(error)}`);
        this.clearAuthAndRedirect();
    } else {
        Logger.error(`API error: ${JSON.stringify(error)}`);
    }
}

export async function fetchCurrentUser(this: ChatStore): Promise<void> {
    if (this.currentUserId || !getAuthToken()) return;
    try {
        const user = await apiMethods.getCurrentUser();
        this.setCurrentUser(user.id);
        this.connectionError = null;
    } catch (error) {
        handleAuthError.call(this, error);
    }
}

export async function fetchChannelsFromAPI(this: ChatStore): Promise<void> {
    if (!getAuthToken() || this.channels.length > 0 || this.activeRequests.has("channels")) return;

    this.activeRequests.add("channels");
    this.isLoading = true;

    try {
        const apiChannels: APIChannel[] = await apiMethods.userChannelsList();
        this.channels = apiChannels.map(createChannelFromAPI).filter(Boolean);
    } catch (error) {
        handleAuthError.call(this, error);
    } finally {
        this.activeRequests.delete("channels");
        this.isLoading = false;
    }
}

export async function fetchMessages( this: ChatStore, channelId: number, beforeTimestamp?: number ): Promise<void> {
    if (
        !getAuthToken() ||
        this.activeRequests.has(channelId) ||
        !this.hasMoreMessagesByChannelId.get(channelId)
    )
        return;

    const isInitial = beforeTimestamp === undefined;
    if (isInitial) this.isInitialLoad.set(channelId, true);
    this.activeRequests.add(channelId);

    const controller = new AbortController();
    this.abortControllers.set(channelId, controller);
    this.isLoadingHistory = true;

    try {
        const query: RESTGetAPIMessageListQuery = { limit: 50 };
        if (beforeTimestamp !== undefined) {
            query.before = beforeTimestamp;
        }

        const newMessages = await apiMethods.listMessages(channelId, query);
        const ordered = isInitial ? newMessages : [...newMessages].reverse();

        if (ordered.length) {
            if (isInitial) this.isInitialLoad.set(channelId, false);

            const existing = new Set(this.messagesByChannelId[channelId]?.map(m => m.id) ?? []);
            const transformed = ordered
                .map(transformToMessage)
                .filter(m => !existing.has(m.id));

            this.messagesByChannelId[channelId] = isInitial
                ? transformed
                : [...(this.messagesByChannelId[channelId] ?? []), ...transformed];

            this.hasMoreMessagesByChannelId.set(channelId, newMessages.length === 30);
        }
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            Logger.debug(`Request aborted: ${error.message}`);
        } else {
            handleAuthError.call(this, error);
        }
    } finally {
        this.activeRequests.delete(channelId);
        this.abortControllers.delete(channelId);
        this.isLoadingHistory = false;
    }
}

function readFileAsUint8Array(file: File): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => { resolve(new Uint8Array(reader.result as ArrayBuffer)); };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

const apiUrl = import.meta.env.PROD
    ? "https://api.foxogram.su"
    : "https://api.dev.foxogram.su";

export async function sendMessage(this: ChatStore, content: string, files: File[] = []): Promise<void> {
    if (!this.currentChannelId || !this.currentUserId) return;

    this.isSendingMessage = true;

    try {
        const trimmedContent = content.trim();
        const token = getAuthToken();
        if (!token) throw new Error("No auth token");

        const url = `${apiUrl}/messages/channel/${this.currentChannelId}`;
        const formData = new FormData();
        formData.append("content", trimmedContent || " ");

        files.forEach(file => {
            formData.append("attachments", file);
        });

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(JSON.stringify({
                status: response.status,
                ...errorBody,
            }));
        }

        const responseData = await response.json();
        const msg = transformToMessage(responseData);

        const existingMessages = this.messagesByChannelId[msg.channel.id] ?? [];
        if (!existingMessages.some(m => m.id === msg.id)) {
            this.messagesByChannelId[msg.channel.id] = [...existingMessages, msg];
            this.updateChannelLastMessage(msg.channel.id, msg);
        }

        this.playSendMessageSound();
    } catch (error) {
        Logger.error(`sendMessage error: ${JSON.stringify(error)}`);
        this.connectionError = "Failed to send message";
    } finally {
        this.isSendingMessage = false;
    }
}

export async function retryMessage(this: ChatStore, messageId: number): Promise<void> {
    if (!this.currentChannelId) return;

    const channelMessages = this.messagesByChannelId[this.currentChannelId];
    const msg = channelMessages?.find(m => m.id === messageId);
    if (!msg) return;

    const attachments = msg.attachments.map(attachment => new File([attachment], "filename", { type: "application/octet-stream" }));

    await this.sendMessage(msg.content, attachments);
    this.deleteMessage(messageId);
}
