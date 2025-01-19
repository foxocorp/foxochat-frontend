import { WebSocketClient } from "../gateway/webSocketClient.ts";
import { APIChannel, APIMessage, APIUser, UserFlags, UserType } from "@foxogram/api-types";
import React from "react";

/* === Interface Definitions === */

export interface User {
    id: number;
    channels: number[];
    avatar: string;
    display_name: string;
    username: string;
    email: string;
    flags: UserFlags;
    type: UserType;
    created_at: number;
}

export interface Message {
    id: number;
    content: string;
    author: APIUser;
    channel: APIChannel;
    attachments: string[];
    created_at: number;
}


export interface Channel {
    id: number;
    name: string;
    display_name: string;
    icon: string | null;
    type: number;
    owner: User;
    created_at: number;
    lastMessage: APIMessage | null;
}

/* === Props Section === */

/* Chat Props */
export interface ChatWindowProps {
    channel: Channel;
    wsClient: WebSocketClient;
    currentUserId: number;
}

export interface ChatListProps {
    chats: Channel[];
    onSelectChat: (chat: Channel) => void;
    currentUser: number;
}

export interface ChatHeaderProps {
    avatar: string | null;
    displayName?: string | null;
    username: string;
    status: string;
}

export interface ChatItemProps {
    chat: Channel;
    onSelectChat: (chat: Channel) => void;
    isActive: boolean;
    currentUser: number;
}

/* Message Props */
export interface MessageListProps {
    messages: Message[];
    currentUserId: number;
    onScroll: (event: Event) => void;
    messageListRef: React.RefObject<HTMLDivElement>;
}

export interface MessageInputProps {
    channelId: number;
}

/* Other Props */
export interface EmptyStateProps {
    chats: Channel[];
    onSelectChat: (chat: Channel) => void;
    selectedChat: Channel | null;
}

export interface UserInfoProps {
    username: string;
    avatar: string;
    status?: string;
}

export interface SidebarProps {
    chats: Channel[];
    onSelectChat: (chat: Channel) => void;
    currentUser: number;
}