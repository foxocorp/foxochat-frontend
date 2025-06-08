import type { WebSocketClient } from "@/gateway/webSocketClient";
import { apiMethods } from "@services/API/apiMethods";
import { Logger } from "@utils/logger";
import {
	APIChannel,
	APIMessage,
	RESTGetAPIMessageListQuery,
} from "foxochat.js";
import {
	IObservableArray,
	action,
	configure,
	observable,
	runInAction,
} from "mobx";
import * as apiService from "./apiService";
import { transformToMessage } from "./transforms";
import * as wsService from "./websocketService";

configure({ enforceActions: "observed" });

export class AppStore {
	@observable accessor messagesByChannelId = observable.map<
		number,
		IObservableArray<APIMessage>
	>();
	@observable accessor hasMoreMessagesByChannelId = observable.map<
		number,
		boolean
	>();
	@observable accessor abortControllers = observable.map<
		number,
		AbortController
	>();
	@observable accessor isInitialLoad = observable.map<number, boolean>();

	@observable accessor channels: IObservableArray<APIChannel> =
		observable.array([]);
	@observable accessor activeRequests = new Set<string | number>();

	@observable accessor currentChannelId: number | null = null;
	@observable accessor currentUserId: number | null = null;
	@observable accessor isLoading = false;
	@observable accessor isSendingMessage = false;
	@observable accessor connectionError: string | null = null;
	@observable accessor isWsInitialized = false;
	@observable accessor isLoadingHistory = false;

	@observable accessor channelScrollPositions = observable.map<
		number,
		number
	>();
	@observable accessor lastViewedMessageTimestamps = observable.map<
		number,
		number
	>();

	@observable accessor loadingInitial: Set<number> = observable.set<number>();

	wsClient: WebSocketClient | null = null;

	constructor() {
		this.initializeFromUrl().catch((error: unknown) => {
			Logger.error(`Failed to initialize from URL: ${error}`);
		});
	}

	async initChannel(channelId: number) {
		if (this.messagesByChannelId.has(channelId)) return;

		this.loadingInitial.add(channelId);
		await this.fetchMessages(channelId).finally(() => {
			this.loadingInitial.delete(channelId);
		});
	}

	@action.bound
	setIsSendingMessage(state: boolean) {
		this.isSendingMessage = state;
	}

	@action
	updateMessagesForChannel(channelId: number, messages: APIMessage[]) {
		const target = this.messagesByChannelId.get(channelId);
		if (target) {
			target.replace(messages);
		} else {
			this.messagesByChannelId.set(channelId, observable.array(messages));
		}
	}

	@action
	handleNewMessage(message: APIMessage) {
		Logger.info("Handling new message:", message);

		const channelId = message.channel.id;
		let messages = this.messagesByChannelId.get(channelId);

		if (!messages) {
			Logger.info("No existing messages for channel, creating new array...");
			messages = observable.array([]);
			this.messagesByChannelId.set(channelId, messages);
		}

		const existingIndex = messages.findIndex((m) => m.id === message.id);
		if (existingIndex >= 0) {
			Logger.info("Message already exists, updating...");
			messages.splice(existingIndex, 1, message);
		} else {
			Logger.info("Adding new message...");
			messages.push(message);
		}

		runInAction(() => {
			Logger.info("Sorting messages...");
			messages.replace(
				[...messages].sort((a, b) => a.created_at - b.created_at),
			);
		});

		const channelIndex = this.channels.findIndex((c) => c.id === channelId);
		if (channelIndex >= 0) {
			Logger.info("Updating last message in channel...");
			this.channels[channelIndex].last_message = message;
		}

		if (this.currentChannelId === channelId) {
			Logger.info("Playing send message sound...");
			this.playSendMessageSound();

			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					const container = document.getElementById("message-container");
					if (container) {
						Logger.info("Scrolling to bottom...");
						container.scrollTop = container.scrollHeight;
					}
				});
			});
		}
	}

	@action
	setIsLoading(isLoading: boolean) {
		this.isLoading = isLoading;
	}

	@action
	async joinChannel(channelId: number) {
		const joined = await apiMethods.joinChannel(channelId);
		if (!this.channels.some((c) => c.id === channelId)) {
			this.channels.unshift(joined.channel);
		}
		await this.setCurrentChannel(channelId);
	}

	@action
	async initializeFromUrl() {
		const hash = window.location.hash.substring(1);
		if (!hash || isNaN(Number(hash))) return;
		const channelId = Number(hash);

		if (!this.channels.length) {
			await this.fetchChannelsFromAPI();
		}

		if (this.channels.some((c) => c.id === channelId)) {
			await this.setCurrentChannel(channelId);
		}
	}

	@action
	setCurrentUser(userId: number) {
		this.currentUserId = userId;
	}

	@action
	setHasMoreMessages(channelId: number, hasMore: boolean) {
		this.hasMoreMessagesByChannelId.set(channelId, hasMore);
	}

	@action
	updateMessage(messageId: number, newContent: string) {
		const cid = this.currentChannelId;
		if (!cid) return;

		const msgs = this.messagesByChannelId.get(cid);
		if (!msgs) return;

		const idx = msgs.findIndex((m) => m.id === messageId);
		if (idx < 0) return;

		msgs.splice(idx, 1, { ...msgs[idx], content: newContent });
	}

	@action
	deleteMessage(messageId: number) {
		const cid = this.currentChannelId;
		if (!cid) return;

		const msgs = this.messagesByChannelId.get(cid);
		if (!msgs) return;

		const filtered = msgs.filter((m) => m.id !== messageId);
		this.messagesByChannelId.set(cid, observable.array(filtered));
	}

	@action
	updateChannelLastMessage() {
		this.channels = this.channels.filter((c) => c !== null);
	}

	@action
	async setCurrentChannel(channelId: number | null) {
		if (this.currentChannelId === channelId) return;
		this.currentChannelId = channelId;

		if (channelId !== null) {
			localStorage.setItem("currentChannelId", String(channelId));

			if (!this.messagesByChannelId.has(channelId)) {
				this.messagesByChannelId.set(channelId, observable.array([]));
			}

			this.isLoadingHistory = false;
			this.activeRequests.delete(channelId);
			await this.loadChannelData(channelId, true);
		} else {
			localStorage.removeItem("currentChannelId");
		}
	}

	@action
	async fetchMessages(
		channelId: number,
		query: RESTGetAPIMessageListQuery = {},
	) {
		if (this.activeRequests.has(channelId)) return;

		runInAction(() => {
			this.activeRequests.add(channelId);
			this.isLoadingHistory = true;
		});

		try {
			const defaultQuery: RESTGetAPIMessageListQuery = { limit: 50, ...query };

			const newMessages = await apiMethods.listMessages(
				channelId,
				defaultQuery,
			);
			const transformed = newMessages
				.map(transformToMessage)
				.sort((a, b) => a.created_at - b.created_at);

			runInAction(() => {
				const existing = this.messagesByChannelId.get(channelId) ?? [];

				let updated: APIMessage[];
				if (query.before) {
					updated = [...existing, ...transformed];
				} else {
					updated = [...transformed, ...existing];
				}

				const uniqueMessages = this.removeDuplicateMessages(updated);

				uniqueMessages.sort((a, b) => a.created_at - b.created_at);

				this.messagesByChannelId.set(
					channelId,
					observable.array(uniqueMessages),
				);
				this.hasMoreMessagesByChannelId.set(
					channelId,
					newMessages.length >= 50,
				);
			});
		} catch (error) {
			Logger.error("Failed to fetch messages:", error);
		} finally {
			runInAction(() => {
				this.activeRequests.delete(channelId);
				this.isLoadingHistory = false;
			});
		}
	}

	removeDuplicateMessages(messages: APIMessage[]): APIMessage[] {
		const uniqueMessages: Record<number, APIMessage> = {};

		for (const message of messages) {
			uniqueMessages[message.id] = message;
		}

		return Object.values(uniqueMessages);
	}

	@action
	async loadChannelData(channelId: number, replace = false) {
		try {
			this.isInitialLoad.set(channelId, false);

			const messages = await apiMethods.listMessages(channelId);
			runInAction(() => {
				if (replace) {
					this.updateMessagesForChannel(channelId, messages);
				} else {
					const list =
						this.messagesByChannelId.get(channelId) ?? observable.array([]);
					list.push(...messages);
				}
				this.setHasMoreMessages(channelId, messages.length > 0);
				this.isInitialLoad.set(channelId, true);
			});
		} catch (err) {
			Logger.error("Failed to load channel data", err);
		} finally {
			runInAction(() => {
				this.activeRequests.delete(channelId);
			});
		}
	}

	@action
	async initializeStore() {
		try {
			this.setIsLoading(true);
			Logger.info("Starting store initialization...");
			await this.fetchCurrentUser();
			Logger.info("Current user fetched successfully");
			await this.fetchChannelsFromAPI();
			Logger.info("Channels fetched successfully");
			await this.initializeWebSocket();
			Logger.info("WebSocket initialized successfully");
		} catch (error) {
			Logger.error("Initialization failed:", error);
			this.connectionError = "Initialization error";
			throw error;
		} finally {
			this.setIsLoading(false);
		}
	}

	@action
	addNewChannel(channel: APIChannel) {
		const observableChannel = observable.object(channel);
		if (!this.channels.some((c) => c.id === observableChannel.id)) {
			this.channels.unshift(observableChannel);
		}
	}

	playSendMessageSound() {
		const audio = new Audio("/sounds/fchat_sfx.mp3");
		audio.play().catch((e: unknown) => {
			console.error(e);
		});
	}

	fetchCurrentUser = apiService.fetchCurrentUser;
	fetchChannelsFromAPI = apiService.fetchChannelsFromAPI;
	sendMessage = apiService.sendMessage;
	retryMessage = apiService.retryMessage;

	clearAuthAndRedirect = wsService.clearAuthAndRedirect;
	initializeWebSocket = wsService.initializeWebSocket;
	handleHistorySync = wsService.handleHistorySync;
	setupWebSocketHandlers = wsService.setupWebSocketHandlers;
}
