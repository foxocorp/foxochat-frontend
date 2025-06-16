import { WebSocketClient } from "@/gateway/webSocketClient";
import { getAuthToken } from "@services/API/apiMethods";
import { client } from "@services/FoxoChatClient";
import { transformToMessage } from "@store/app/transforms";
import { Logger } from "@utils/logger";
import { runInAction } from "mobx";
import { AppStore } from "./appStore";

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
		this.wsClient = new WebSocketClient(
			client,
			() => token,
			(event) => {
				if (event.code === 4001) {
					Logger.info("WebSocket unauthorized, clearing auth");
					clearAuthAndRedirect();
				} else if (event.code === 4002) {
					Logger.warn("Heartbeat timeout, attempting to reconnect");
					runInAction(() => {
						this.connectionError = "Connection timeout, reconnecting...";
						this.isWsInitialized = false;
					});
				} else {
					runInAction(() => {
						this.connectionError = `Connection closed with code ${event.code}${event.reason ? `: ${event.reason}` : ""}`;
						this.isWsInitialized = false;
					});
				}
			},
			() => {
				Logger.info("WebSocket unauthorized (login failed), clearing auth");
				clearAuthAndRedirect();
			},
		);

		this.setupWebSocketHandlers();

		try {
			Logger.info("Attempting to connect WebSocket...");
			await this.wsClient.connect();
			Logger.info("WebSocket connection established");

			runInAction(() => {
				this.connectionError = null;
				this.isWsInitialized = true;
			});

			if (this.currentChannelId) {
				this.handleHistorySync();
			}
		} catch (err: unknown) {
			Logger.error(`Failed to connect WebSocket: ${err}`);
			runInAction(() => {
				this.connectionError = `Failed to connect WebSocket: ${err instanceof Error ? err.message : String(err)}`;
				this.isWsInitialized = false;
			});
			throw err;
		}
	}
}

export function handleHistorySync(this: AppStore): void {
	if (!this.currentChannelId || !this.isWsInitialized) {
		Logger.warn(
			"Cannot sync history: no current channel or WebSocket not initialized",
		);
		return;
	}

	Logger.info(`Syncing message history for channel: ${this.currentChannelId}`);

	this.fetchInitialMessages(this.currentChannelId).catch((err: Error) => {
		Logger.error(`Failed to sync message history: ${err.message}`);
		runInAction(() => {
			this.connectionError = `Failed to sync message history: ${err.message}`;
		});
	});
}

export function setupWebSocketHandlers(this: AppStore): void {
	if (!this.wsClient) {
		Logger.warn("Cannot setup WebSocket handlers: no WebSocket client");
		return;
	}

	this.wsClient.on("MESSAGE_CREATE", (data: unknown) => {
		if (!this.isWsInitialized) {
			return;
		}

		try {
			let raw: unknown;
			if (typeof data === "object") {
				raw = data;
			} else if (typeof data === "string") {
				try {
					raw = JSON.parse(data) as unknown;
				} catch {
					return;
				}
			} else {
				return;
			}
			const message = transformToMessage(raw);
			runInAction(() => {
				const existing = this.messagesByChannelId.get(message.channel.id);
				const alreadyExists = existing?.some((m) => m.id === message.id);
				if (alreadyExists) {
					return;
				}
				this.handleNewMessage(message);
				const channelIndex = this.channels.findIndex(
					(c) => c.id === message.channel.id,
				);
				if (channelIndex >= 0 && this.channels[channelIndex]) {
					this.channels[channelIndex] = {
						...this.channels[channelIndex],
						last_message: message,
					};
				}
			});
		} catch (err) {
			Logger.error(
				`Error processing MESSAGE_CREATE: ${err instanceof Error ? err.message : String(err)}`,
			);
		}
	});

	this.wsClient.on("MESSAGE_DELETE", (data: unknown) => {
		if (!this.isWsInitialized) {
			return;
		}

		try {
			let messageId: number | null = null;
			if (typeof data === "object" && data && "id" in data) {
				messageId = Number((data as { id: number }).id);
			} else if (typeof data === "string") {
				try {
					const parsed = JSON.parse(data) as { id: number };
					messageId = parsed.id;
				} catch {
					return;
				}
			}
			if (!messageId) return;
			runInAction(() => {
				this.deleteMessage(messageId);
			});
		} catch (err) {
			Logger.error(
				`Error processing MESSAGE_DELETE: ${err instanceof Error ? err.message : String(err)}`,
			);
		}
	});
}
