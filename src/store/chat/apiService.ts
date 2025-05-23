import { apiMethods, getAuthToken } from "@services/API/apiMethods";
import { Logger } from "@utils/logger";
import type { ChatStore } from "./chatStore";
import { createChannelFromAPI, transformToMessage } from "./transforms";
import type { APIChannel, RESTGetAPIMessageListQuery } from "@foxogram/api-types";
import { observable, runInAction } from "mobx";

interface AuthError {
    response?: { status?: number };
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
        runInAction(() => {
            this.setCurrentUser(user.id);
            this.connectionError = null;
        });
    } catch (error) {
        handleAuthError.call(this, error);
    }
}

export async function fetchChannelsFromAPI(this: ChatStore): Promise<APIChannel[]> {
    if (!getAuthToken() || this.channels.length > 0 || this.activeRequests.has("channels")) {
        return this.channels;
    }

    runInAction(() => {
        this.activeRequests.add("channels");
        this.isLoading = true;
    });

    try {
        const apiChannels: APIChannel[] = await apiMethods.userChannelsList();

        runInAction(() => {
            this.channels = observable.array(
                apiChannels
                    .map(channel => observable.object(createChannelFromAPI(channel)))
                    .filter(Boolean) as APIChannel[],
            );
        });

        return this.channels;
    } catch (error) {
        handleAuthError.call(this, error);
        throw error;
    } finally {
        runInAction(() => {
            this.isLoading = false;
            this.activeRequests.delete("channels");
        });
    }
}

export async function fetchMessages(this: ChatStore, channelId: number, query: RESTGetAPIMessageListQuery = {}): Promise<void> {
    if (this.activeRequests.has(channelId)) return;

    runInAction(() => {
        this.activeRequests.add(channelId);
        this.isLoadingHistory = true;
    });

    try {
        const defaultQuery: RESTGetAPIMessageListQuery = { limit: 50, ...query };

        const newMessages = await apiMethods.listMessages(channelId, defaultQuery);
        const transformed = newMessages
            .map(transformToMessage)
            .sort((a, b) => a.created_at - b.created_at);

        runInAction(() => {
            const existing = this.messagesByChannelId.get(channelId) ?? [];

            let updated: any[];
            if (query.before) {
                updated = [...existing, ...transformed];
            } else {
                updated = [...transformed, ...existing];
            }

            const uniqueMessages = removeDuplicateMessages(updated);

            uniqueMessages.sort((a, b) => a.created_at - b.created_at);

            this.messagesByChannelId.set(channelId, observable.array(uniqueMessages));
            this.hasMoreMessagesByChannelId.set(channelId, newMessages.length >= 50);
        });
    } catch (error) {
        Logger.error(`fetchMessages error: ${JSON.stringify(error)}`);
    } finally {
        runInAction(() => {
            this.activeRequests.delete(channelId);
            this.isLoadingHistory = false;
        });
    }
}

function removeDuplicateMessages(messages: any[]): any[] {
    const uniqueMessages: Record<number, any> = {};

    for (const message of messages) {
        uniqueMessages[message.id] = message;
    }

    return Object.values(uniqueMessages);
}

export async function sendMessage(this: ChatStore, content: string, files: File[] = []): Promise<void> {
    if (!this.currentChannelId || !this.currentUserId) return;

    const channelId = this.currentChannelId;

    runInAction(() => {
        this.isSendingMessage = true;
    });

    try {
        let attachmentIds: number[] = [];
        if (files.length > 0) {
            const atts = await apiMethods.createMessageAttachments(channelId, files);
            await Promise.all(
                atts.map((att, idx) =>
                    apiMethods.uploadFileToStorage(att.uploadUrl, files[idx]),
                ),
            );
            attachmentIds = atts.map(att => att.id);
        }

        const apiMsg = await apiMethods.createMessage(channelId, content, attachmentIds);
        const message = transformToMessage(apiMsg);

        runInAction(() => {
            const messages = this.messagesByChannelId.get(channelId) ?? [];
            messages.push(message);
            this.messagesByChannelId.set(channelId, observable.array(messages));
            this.isSendingMessage = false;
        });
    } catch (error) {
        runInAction(() => {
            this.isSendingMessage = false;
            this.connectionError = "Failed to send message";
        });
        Logger.error(`Failed to send message: ${error}`);
    }
}

export async function retryMessage(this: ChatStore, messageId: number): Promise<void> {
    const channelId = this.currentChannelId;
    if (channelId === null) return;

    const msgs = this.messagesByChannelId.get(channelId) ?? [];
    const msg = msgs.find((m) => m.id === messageId);
    if (!msg) return;

    await this.sendMessage(msg.content, msg.attachments.map((att) => new File([att], "file")));
    this.deleteMessage(messageId);
}