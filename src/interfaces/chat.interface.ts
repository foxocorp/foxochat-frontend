import { WebSocketClient } from "../gateway/webSocketClient.ts";
import { APIUser } from "@foxogram/api-types";

export interface User {
    user: APIUser;
    channels: number[];
    id: number;
    avatar: string;
    display_name: string;
    username: string;
    flags: number;
    type: number;
    created_at: number;
}

export interface Author {
    member: string;
    id: number;
    user: User;
    permissions: number;
    joined_at: number;
}

export interface Message {
    id: number;
    content: string;
    author: Author;
    channel: number;
    attachments: string[];
    created_at: number;
}

export interface Channel {
    id: number;
    display_name: string;
    name: string;
    icon: string | null;
    type: number;
    owner: User;
    created_at: number;
    lastMessage: Message | null;
}

/* === Props Section === */

/* Chat Props */
export interface ChatWindowProps {
    channel: Channel;
    wsClient: WebSocketClient;
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
    currentUser: number;
}


/* Message Props */
export interface MessageListProps {
    messages: Message[];
}

export interface MessageInputProps {
    onSendMessage: (message: string) => void;
    onSendMedia?: () => void;
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



