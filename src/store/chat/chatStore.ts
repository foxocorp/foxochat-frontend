import {
    action,
    flow,
    makeAutoObservable,
    observable,
    runInAction,
} from "mobx";

import * as apiService from "./apiService";
import * as wsService from "./websocketService";
import type { WebSocketClient } from "../../gateway/webSocketClient";
import { Channel, Message, User } from "@interfaces/interfaces";
import { APIChannel } from "@foxogram/api-types";
import { apiMethods } from "@services/API/apiMethods";

export class ChatStore {
    @action
    addNewChannel(apiChannel: APIChannel) {
        const newChannel = new Channel({
            id: apiChannel.id,
            name: apiChannel.name,
            display_name: apiChannel.display_name,
            type: apiChannel.type,
            member_count: apiChannel.member_count,
            owner: new User(apiChannel.owner),
            created_at: Date.now(),
            lastMessage: apiChannel.last_message
                ? new Message(apiChannel.last_message)
                : null,
            createdAt: new Date().toISOString(),
        });

        this.channels.unshift(newChannel);
    }
    @action
    handleNewMessage(message: Message) {
        const channelId = message.channel.id;
        const channelIndex = this.channels.findIndex(c => c.id === channelId);

        if (channelIndex > -1) {
            const updatedChannel = new Channel({
                ...this.channels[channelIndex],
                lastMessage: message
            });

            this.channels.splice(channelIndex, 1);
            this.channels.unshift(updatedChannel);
        }

        this.messagesByChannelId[channelId] ??= [];
        this.messagesByChannelId[channelId].push(message);
    }

    @action
    async joinChannel(channelId: number) {
        try {
            const channel = await apiMethods.getChannel(channelId);
            this.addNewChannel(channel);
            await this.setCurrentChannel(channelId);
        } catch (error) {
            console.error("Join channel error:", error);
            throw error;
        }
    }
    messagesByChannelId: Record<number, Message[]> = {};
    channels: Channel[] = [];
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
        const idx = msgs?.findIndex(m => m.id === messageId);
        if (idx == null || idx < 0) return;
        runInAction(() => {
            msgs[idx].content = newContent;
        });
    });

    deleteMessage = action((messageId: number) => {
        const cid = this.currentChannelId;
        if (!cid) return;
        runInAction(() => {
            this.messagesByChannelId[cid] = this.messagesByChannelId[cid].filter(
                m => m.id !== messageId,
            );
        });
    });
    
    updateChannelLastMessage = action((channelId: number, message: Message) => {
        this.channels = this.channels.map(ch =>
            ch.id === channelId ? new Channel({ ...ch, lastMessage: message }) : ch,
        );
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
