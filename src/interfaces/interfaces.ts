import {
    APIChannel,
    APIMember,
    APIMessage,
    ChannelType,
} from "@foxogram/api-types";
import React from "react";
import type { ContainerNode } from "preact";

/* === Props Section === */

/**
 * Chat Props
 */

export interface ChatWindowProps {
    channel: APIChannel;
    currentUserId: number;
    isMobile: boolean;
    onBack?: () => void;
}

export interface ChatListProps {
    chats: APIChannel[];
    onSelectChat: (chat: APIChannel) => void;
    currentUser: number;
}

export interface ChatHeaderProps {
    chat: APIChannel;
    avatar?: string | null;
    displayName?: string | null;
    username: string;
    channelId: number;
    isMobile: boolean;
    onBack?: () => void
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

export interface PreComponentProps {
    className?: string;
    language?: string;
    codeHtml: string;
    codeText: string;
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
    showAvatar: boolean
}

export interface Attachment {
    id: number;
    uuid: string;
    filename: string;
    content_type: string;
    flags: number;
    thumbhash?: string;
}

/**
 * Message Prop
 */

export interface MessageListProps {
    messages: APIMessage[];
    currentUserId: number;
    isLoading: boolean;
    channel: APIChannel;
    onScroll: (event: Event) => void;
    messageListRef: React.RefObject<HTMLDivElement>;
    lastMessageRef?: React.RefObject<HTMLDivElement>;
    isInitialLoading: boolean;
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
    isMobile?: boolean;
    setMobileView?: (view: "list" | "chat") => void;
    setChatTransition?: (transition: string) => void;
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

export interface CopyBubbleProps {
    show: boolean;
    text: string;
    duration?: number | undefined;
    onHide?: (() => void) | undefined;
}

export interface ActiveBubble {
    container: ContainerNode;
    timer: number;
    props: CopyBubbleProps;
}

export interface CopyBubbleComponent {
    (props: CopyBubbleProps): (() => void) | null;
    activeBubble: ActiveBubble | null;
}

export interface RouteConfig {
    path: string;
    component: preact.FunctionComponent<any>;
}