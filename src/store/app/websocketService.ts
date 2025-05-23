import { getAuthToken } from "@services/API/apiMethods";
import { initWebSocket } from "@/gateway/initWebSocket";
import { GatewayDispatchEvents } from "@foxogram/gateway-types";
import { Logger } from "@utils/logger";
import { AppStore } from "./appStore";
import { runInAction } from "mobx";
import { transformToMessage } from "@store/app/transforms";

export function clearAuthAndRedirect(): void {
    localStorage.removeItem("authToken");
    window.location.href = "/auth/login";
}

export async function initializeWebSocket(this: AppStore): Promise<void> {
    if (this.wsClient && this.isWsInitialized) {
        Logger.info("WebSocket already initialized");
        return;
    }

    const token = getAuthToken();

    if (!token) {
        Logger.info("No token found, skipping WebSocket initialization");
        return;
    }

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
            Logger.error("WebSocket socketError:", error);
            runInAction(() => {
                this.connectionError = `Socket error: ${error instanceof Error ? error.message : String(error)}`;
            });
        });

        this.wsClient.client.on("closed", (code: number) => {
            Logger.error(`WebSocket closed with code: ${code}`);
            runInAction(() => {
                this.isWsInitialized = false;
                this.connectionError = `Connection closed with code ${code}`;
            });
        });

        this.setupWebSocketHandlers();
    }

    try {
        Logger.info("Attempting to connect WebSocket...");
        await this.wsClient.connect();
        Logger.info("WebSocket connect method completed");
    } catch (err: unknown) {
        Logger.error("Failed to connect WebSocket:", err);
        runInAction(() => {
            this.connectionError = `Failed to connect WebSocket: ${err instanceof Error ? err.message : String(err)}`;
        });
    }
}

export function handleHistorySync(this: AppStore): void {
    if (!this.currentChannelId) return;

    Logger.info("Syncing message history for channel:", this.currentChannelId);

    this.fetchMessages(this.currentChannelId).catch((err: unknown) => {
        Logger.error(`History sync error: ${err}`);
    });
}

export function setupWebSocketHandlers(this: AppStore): void {
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
                    messageId = parsed.id;
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