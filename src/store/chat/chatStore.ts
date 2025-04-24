import * as apiService from "./apiService";
import * as wsService from "./websocketService";
import { action, flow, makeAutoObservable, observable, runInAction } from "mobx";
import { apiMethods } from "@services/API/apiMethods";
import { APIChannel, APIMessage } from "@foxogram/api-types";
import type { WebSocketClient } from "../../gateway/webSocketClient";
import { Logger } from "@utils/logger";

export class ChatStore {
    @action
    addNewChannel(apiChannel: APIChannel) {
        this.channels.unshift(apiChannel);
    }

    @action
    handleNewMessage(message: APIMessage) {
        const channelId = typeof message.channel === "object" ? message.channel.id : message.channel;

        const channelIndex = this.channels.findIndex(c => c?.id === channelId);
        if (channelIndex > -1) {
            const ch = this.channels[channelIndex];
            if (!ch) return;

            const updatedChannel: APIChannel = {
                ...ch,
                last_message: message,
            };

            runInAction(() => {
                this.channels.splice(channelIndex, 1);
                this.channels.unshift(updatedChannel);
            });
        }

        runInAction(() => {
            (this.messagesByChannelId[channelId] ??= []).push(message);
        });
    }

    @action
    setIsLoading(isLoading: boolean) {
        this.isLoading = isLoading;
    }

    @action
    async joinChannel(channelId: number) {
        try {
            const joined = await apiMethods.joinChannel(channelId);

            const channel = joined.channel;

            const alreadyExists = this.channels.some(ch => ch?.id === channelId);

            if (!alreadyExists) {
                runInAction(() => {
                    this.channels.unshift(channel);
                });
            }

            await this.setCurrentChannel(channelId);
        } catch (error) {
            console.error("Join channel error:", error);
            throw error;
        }
    }

    @action
    private async initializeFromUrl() {
        const hash = window.location.hash.substring(1);
        if (!hash || isNaN(Number(hash))) return;

        const channelId = Number(hash);

        if (!this.channels.length) {
            await this.fetchChannelsFromAPI();
        }

        if (this.channels.some(c => c?.id === channelId)) {
            await this.setCurrentChannel(channelId);
        }
    }

    messagesByChannelId: Record<number, APIMessage[]> = {};
    channels: (APIChannel | null)[] = [];
    currentChannelId: number | null = null;
    currentUserId: number | null = null;
    isLoading = false;
    isSendingMessage = false;
    connectionError: string | null = null;
    wsClient: WebSocketClient | null = null;
    activeRequests = new Set<string | number>();
    hasMoreMessagesByChannelId = observable.map<number, boolean>();
    abortControllers = new Map<number, AbortController>();
    isWsInitialized = false;
    isLoadingHistory = false;
    isInitialLoad = observable.map<number, boolean>();

    constructor() {
        makeAutoObservable(
            this,
            {
                messagesByChannelId: observable,
                channels: observable,
                currentChannelId: observable,
                currentUserId: observable,
                isLoading: observable,
                isSendingMessage: observable,
                connectionError: observable,
                isWsInitialized: observable,
                isInitialLoad: observable,

                fetchChannelsFromAPI: action,
                handleNewMessage: action,
                updateMessage: action,
                deleteMessage: action,
                setCurrentUser: action,

                initializeStore: flow,
            },
            { autoBind: true },
        );

        this.initializeFromUrl().catch((error: unknown) => {
            Logger.error(`Failed to initialize from URL: ${error}`);
        });
    }

    fetchCurrentUser = apiService.fetchCurrentUser;
    fetchChannelsFromAPI = apiService.fetchChannelsFromAPI;
    fetchMessages = apiService.fetchMessages;
    sendMessage = apiService.sendMessage;
    retryMessage = apiService.retryMessage;

    clearAuthAndRedirect = wsService.clearAuthAndRedirect;
    private initializeWebSocket = wsService.initializeWebSocket;
    handleHistorySync = wsService.handleHistorySync;
    setupWebSocketHandlers = wsService.setupWebSocketHandlers;

    setCurrentUser = action((userId: number) => {
        this.currentUserId = userId;
    });

    setHasMoreMessages = action((channelId: number, hasMore: boolean) => {
        this.hasMoreMessagesByChannelId.set(channelId, hasMore);
    });

    updateMessage = action((messageId: number, newContent: string) => {
        const cid = this.currentChannelId;
        if (!cid) return;

        const msgs = this.messagesByChannelId[cid];
        if (!msgs) return;

        const idx = msgs.findIndex(m => m.id === messageId);
        if (idx < 0) return;

        const msg = msgs[idx];
        if (!msg) return;

        runInAction(() => {
            msg.content = newContent;
        });
    });

    deleteMessage = action((messageId: number) => {
        const cid = this.currentChannelId;
        if (!cid) return;
        const msgs = this.messagesByChannelId[cid];
        if (!msgs) return;
        runInAction(() => {
            this.messagesByChannelId[cid] = msgs.filter(m => m.id !== messageId);
        });
    });

    updateChannelLastMessage = action(() => {
        this.channels = this.channels.filter(c => c !== null);
    });

    setCurrentChannel = action(async (channelId: number | null) => {
        this.currentChannelId = channelId;
        if (channelId) {
            localStorage.setItem("currentChannelId", String(channelId));
            await this.loadChannelData(channelId);
        } else {
            localStorage.removeItem("currentChannelId");
        }
    });

    private loadChannelData = action(async (channelId: number) => {
        this.setHasMoreMessages(channelId, true);
        if (!this.messagesByChannelId[channelId]?.length) {
            await this.fetchMessages(channelId);
        }
    });

    playSendMessageSound() {
        const audio = new Audio("/sounds/fg_sfx.mp3");
        audio.play().catch((e: unknown) => { console.error(e); });
    }

    *initializeStore() {
        try {
            yield this.fetchCurrentUser();
            yield this.fetchChannelsFromAPI();
            this.initializeWebSocket();
        } catch (error) {
            console.error(error);
            this.connectionError = "Initialization error";
        }
    }
}

export const chatStore = new ChatStore();
