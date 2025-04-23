import {
    APIChannel,
    APIMember,
    APIMessage,
    ChannelType,
} from "@foxogram/api-types";
import React from "react";

/* === Interface Definitions === */

export interface ConnectionManager {
    startHeartbeat(
        interval: number,
        sendHeartbeat: () => void,
        onMissed: () => void
    ): ReturnType<typeof setInterval>;
    cleanupHeartbeat(id: ReturnType<typeof setInterval> | null): void;
    scheduleReconnect: (
        isExplicitClose: boolean,
        currentAttempts: number,
        maxReconnectAttempts: number,
        currentDelay: number,
        reconnectFn: () => void
    ) => ReturnType<typeof setTimeout> | null;
    checkConnectionHealth: (
        isConnected: boolean,
        heartbeatAckReceived: boolean,
        reconnectFn: () => void,
        delay: number
    ) => void;
}

/* === Props Section === */

/**
 * Chat Props
 */

export interface ChatWindowProps {
    channel: APIChannel;
    currentUserId: number;
}

export interface ChatListProps {
    chats: APIChannel[];
    onSelectChat: (chat: APIChannel) => void;
    currentUser: number;
}

export interface ChatHeaderProps {
    avatar: string | null;
    displayName?: string | null;
    username: string;
    channelId: number;
}

export interface ChatItemProps {
    chat: APIChannel,
    onSelectChat: (chat: APIChannel) => void,
    isActive: boolean,
    currentUser: number,
}

export interface MessageGroupProps {
    messages: APIMessage[];
    currentUserId: number;
}

export interface MessageItemProps {
    content: string;
    created_at: number;
    author: APIMember;
    currentUserId: number;
    showAuthorName: boolean;
    attachments: Attachment[];
    status?: "sending" | "sent" | "failed";
    onRetry?: () => void;
    onDelete?: () => void;
}

export interface Attachment {
    id: string;
    content_type: string;
    filename: string;
    flags: number;
}

/**
 * Message Prop
 */

export interface MessageListProps {
    messages: APIMessage[];
    currentUserId: number;
    channel: APIChannel;
    onScroll: (event: Event) => void;
    messageListRef: React.RefObject<HTMLDivElement>;
}

export interface MessageInputProps {
    onMessageSent?: (message: APIMessage) => void,
    onSendMessage: (content: string, files?: File[]) => Promise<void>
    isSending: boolean;
}

/**
 * Other Props
*/

export interface EmptyStateProps {
    chats: APIChannel[];
    onSelectChat: (chat: APIChannel) => void;
    selectedChat: APIChannel | null;
}

export interface UserInfoProps {
    username: string;
    avatar: string;
    status?: string;
}

export interface SidebarProps {
    chats: APIChannel[];
    onSelectChat: (chat: APIChannel) => void;
    currentUser: number;
}

export interface Props {
    onClose: () => void;
    onCreate: (data: {
        name: string;
        displayName: string;
        members?: string[];
        channelType: ChannelType;
    }) => void;
    type: "group" | "channel";
}