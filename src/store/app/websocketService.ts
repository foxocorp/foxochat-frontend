import { WebSocketClient } from "@/gateway/webSocketClient";
import { getAuthToken } from "@services/API/apiMethods";
import { client } from "@services/FoxoChatClient";
import { Logger } from "@utils/logger";
import { runInAction } from "mobx";
import { AppStore } from "./appStore";

export function clearAuthAndRedirect(): void {
	localStorage.removeItem("authToken");
	window.location.href = "/login";
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

		setupWebSocketHandlers(this);

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

export function setupWebSocketHandlers(store: AppStore): void {
	if (!store.wsClient) return;

	store.wsClient.on("MESSAGE_CREATE", (message) => {
		runInAction(() => {
			store.handleNewMessage(message);
		});
	});

	store.wsClient.on("MESSAGE_DELETE", (data) => {
		runInAction(() => {
			store.deleteMessage(data.id);
		});
	});

	store.wsClient.on("USER_STATUS_UPDATE", (data) => {
		runInAction(() => {
			store.updateUserStatus(data.user_id, data.status);
		});
	});
}
