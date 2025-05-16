import { getAuthToken } from "@services/API/apiMethods";
import { initWebSocket } from "../../gateway/initWebSocket";
import { GatewayDispatchEvents } from "@foxogram/gateway-types";
import { Logger } from "@utils/logger";
import type { ChatStore } from "./chatStore";
import { runInAction } from "mobx";
import { transformToMessage } from "@store/chat/transforms";

export function clearAuthAndRedirect(): void {
    localStorage.removeItem("authToken");
    window.location.href = "/auth/login";
}

export async function initializeWebSocket(this: ChatStore): Promise<void> {
    const token = getAuthToken();
    if (!token) return;

    if (this.wsClient && this.isWsInitialized) return;

    if (!this.wsClient) {
        Logger.info("Initializing WebSocket connection...");

        this.wsClient = initWebSocket(token, () => {
            Logger.info("WebSocket unauthorized, clearing auth");
            clearAuthAndRedirect();
        });

        this.wsClient.client.on("ready", () => {
            Logger.info("WebSocket connected successfully");
            runInAction(() => {
                this.connectionError = null;
                this.isWsInitialized = true;
            });
            this.handleHistorySync();
        });

        this.wsClient.client.on("socketError", (error: unknown) => {
            Logger.error("WebSocket error:", error);
            runInAction(() => {
                this.connectionError = "Connection error";
            });
        });

        this.setupWebSocketHandlers();
    }

    try {
        await this.wsClient.connect();
    } catch (err: unknown) {
        Logger.error("Failed to connect WebSocket:", err);
    }
}

export function handleHistorySync(this: ChatStore): void {
    if (!this.currentChannelId) return;

    Logger.info("Syncing message history for channel:", this.currentChannelId);

    this.fetchMessages(this.currentChannelId).catch((err: unknown) => {
        Logger.error(`History sync error: ${err}`);
    });
}

export function setupWebSocketHandlers(this: ChatStore): void {
    if (!this.wsClient) return;

    this.wsClient.client.on(GatewayDispatchEvents.MessageCreate, (data: unknown) => {
        try {
            let raw: unknown;
            if (typeof data === "object") {
                raw = data;
            } else if (typeof data === "string") {
                try {
                    raw = JSON.parse(data) as unknown;
                } catch {
                    Logger.warn("Failed to parse message data");
                    return;
                }
            } else {
                return;
            }
            const message = transformToMessage(raw);
            runInAction(() => {
                const existing = this.messagesByChannelId.get(message.channel.id);
                const alreadyExists = existing?.some((m) => m.id === message.id);
                if (alreadyExists) return;
                this.handleNewMessage(message);
                const channelIndex = this.channels.findIndex((c) => c.id === message.channel.id);
                if (channelIndex >= 0) {
                    this.channels[channelIndex].last_message = message;
                }
            });
        } catch (err) {
            Logger.error("Error processing WebSocket message:", err);
        }
    });

    this.wsClient.client.on(GatewayDispatchEvents.MessageDelete, (data: unknown) => {
        try {
            let messageId: number | null = null;
            if (typeof data === "object" && data && "id" in data) {
                messageId = Number((data as { id: number }).id);
            } else if (typeof data === "string") {
                try {
                    const parsed = JSON.parse(data) as { id: number };
                    if (parsed && typeof parsed.id === "number") {
                        messageId = parsed.id;
                    }
                } catch {
                    Logger.warn("Failed to parse delete message data");
                    return;
                }
            }
            if (!messageId) return;
            runInAction(() => {
                this.deleteMessage(messageId);
            });
        } catch (err) {
            Logger.error("Error processing message delete:", err);
        }
    });
}