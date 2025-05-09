import * as apiService from "./apiService";
import * as wsService from "./websocketService";
import { action, observable, configure, IObservableArray, runInAction } from "mobx";
import { apiMethods } from "@services/API/apiMethods";
import { APIChannel, APIMessage, RESTGetAPIMessageListQuery } from "@foxogram/api-types";
import type { WebSocketClient } from "../../gateway/webSocketClient";
import { Logger } from "@utils/logger";
import { transformToMessage } from "@store/chat/transforms";

configure({ enforceActions: "observed" });

export class ChatStore {
    @observable accessor messagesByChannelId = observable.map<number, IObservableArray<APIMessage>>();
    @observable accessor hasMoreMessagesByChannelId = observable.map<number, boolean>();
    @observable accessor abortControllers = observable.map<number, AbortController>();
    @observable accessor isInitialLoad = observable.map<number, boolean>();

    @observable accessor channels: APIChannel[] = [];
    @observable accessor activeRequests = new Set<string | number>();

    @observable accessor currentChannelId: number | null = null;
    @observable accessor currentUserId: number | null = null;
    @observable accessor isLoading = false;
    @observable accessor isSendingMessage = false;
    @observable accessor connectionError: string | null = null;
    @observable accessor isWsInitialized = false;
    @observable accessor isLoadingHistory = false;

    @observable accessor channelScrollPositions = observable.map<number, number>();
    @observable accessor lastViewedMessageTimestamps = observable.map<number, number>();

    @observable accessor loadingInitial: Set<number> = observable.set<number>();

    wsClient: WebSocketClient | null = null;

    constructor() {
        this.initializeFromUrl().catch((error: unknown) => {
            Logger.error(`Failed to initialize from URL: ${error}`);
        });
    }

    async init() {
        await this.initializeStore();
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
        const channelId = message.channel.id;
        let messages = this.messagesByChannelId.get(channelId);

        if (!messages) {
            messages = observable.array([]);
            this.messagesByChannelId.set(channelId, messages);
        }

        const existingIndex = messages.findIndex(m =>
            m.id === message.id ||
            ((m as any)._tempId && (m as any)._tempId === (message as any)._tempId),
        );

        if (existingIndex >= 0) {
            messages[existingIndex] = message;
        } else {
            messages.push(message);
        }

        messages.sort((a, b) => a.created_at - b.created_at);

        const channelIndex = this.channels.findIndex(c => c.id === channelId);
        if (channelIndex >= 0) {
            this.channels[channelIndex].last_message = message;
        }

        if (this.currentChannelId === channelId) {
            this.playSendMessageSound();

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const container = document.getElementById("message-container");
                    if (container) {
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
        if (!this.channels.some(c => c.id === channelId)) {
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

        if (this.channels.some(c => c.id === channelId)) {
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

        const idx = msgs.findIndex(m => m.id === messageId);
        if (idx < 0) return;

        const msg = { ...msgs[idx], content: newContent };
        msgs[idx] = msg;
    }

    @action
    deleteMessage(messageId: number) {
        const cid = this.currentChannelId;
        if (!cid) return;

        const msgs = this.messagesByChannelId.get(cid);
        if (!msgs) return;

        const filtered = msgs.filter(m => m.id !== messageId);
        this.messagesByChannelId.set(cid, observable.array(filtered));
    }

    @action
    updateChannelLastMessage() {
        this.channels = this.channels.filter(c => c !== null);
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
    async fetchMessages(channelId: number, query: RESTGetAPIMessageListQuery = {}) {
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
                const existing = this.messagesByChannelId.get(channelId) || [];

                let updated: APIMessage[];
                if (query.before) {
                    updated = [...existing, ...transformed];
                } else {
                    updated = [...transformed, ...existing];
                }

                const uniqueMessages = this.removeDuplicateMessages(updated);

                uniqueMessages.sort((a, b) => a.created_at - b.created_at);

                this.messagesByChannelId.set(channelId, observable.array(uniqueMessages));
                this.hasMoreMessagesByChannelId.set(channelId, newMessages.length >= 50);
            });
        } catch (error) {
            console.error("Failed to fetch messages:", error);
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
                    const list = this.messagesByChannelId.get(channelId) ?? observable.array([]);
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
            await this.fetchCurrentUser();
            await this.fetchChannelsFromAPI();
            this.initializeWebSocket();
        } catch (error) {
            console.error(error);
            this.connectionError = "Initialization error";
        }
    }

    playSendMessageSound() {
        const audio = new Audio("/sounds/fg_sfx.mp3");
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

export const chatStore = new ChatStore();
chatStore.init().catch(console.error);