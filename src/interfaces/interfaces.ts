import { CachedChat } from "@store/app/metaCache";
import {
	APIChannel,
	APIMember,
	APIMessage,
	APIUser,
	ChannelType,
} from "foxochat.js";
import {
	ComponentChild,
	ComponentChildren,
	ContainerNode,
	type JSX,
} from "preact";
import React, { Dispatch } from "react";

/* === Props Section === */

/**
 * Chat Props
 */

export interface ChatWindowProps {
	channel: APIChannel | CachedChat;
	currentUserId: number;
	isMobile: boolean;
	onBack?: () => void;
}

export interface ChatListProps {
	chats: (APIChannel | CachedChat)[];
	currentUser: APIUser;
}

export interface ChatHeaderProps {
	chat: APIChannel;
	isMobile?: boolean;
	onBack?: (() => void) | undefined;
	showOverview: boolean;
	avatar?: string | null | undefined;
	displayName?: string | null | undefined;
	username: string;
	channelId: number;
	setShowOverview: Dispatch<boolean>;
}

export interface ChatItemProps {
	chat: APIChannel | CachedChat;
	isActive: boolean;
	currentUser?: number | null;
}

export interface MessageGroupProps {
	messages: APIMessage[];
	currentUserId: number;
	channelId: number;
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
	showAvatar: boolean;
	status?: "sending" | "sent" | "failed";
	messageId: number;
	channelId: number;
	onRetry: () => void;
	onDelete: () => void;
	onEdit: () => void;
	onReply: () => void;
	onForward: () => void;
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
	onMessageSent?: (message: APIMessage) => void;
	onSendMessage: (content: string, files?: File[]) => Promise<void>;
	isSending: boolean;
}

/**
 * Other Props
 */

export interface EmptyStateProps {
	selectedChat: APIChannel | CachedChat | null;
}

export interface UserInfoProps {
	user: APIUser;
	status?: string;
}

export interface SidebarProps {
	currentUser: APIUser;
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
		public?: boolean;
	}) => Promise<boolean>;
	type: "group" | "channel";
}

export interface CreateChannelModalProps extends Props {
	renderError: (
		field: "name",
		error: boolean,
		message: string,
	) => JSX.Element | null;
	nameError: boolean;
	nameErrorMessage: string;
	resetErrors: () => void;
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

export interface ErrorBoundaryProps {
	children: ComponentChild;
}

export interface ErrorBoundaryState {
	hasError: boolean;
}

export interface MediaViewerProps {
	isOpen: boolean;
	attachments: Attachment[];
	initialIndex: number;
	authorName: string;
	authorAvatar?: string | null | undefined;
	createdAt: number;
	onClose: () => void;
	onDelete?: (attachment: Attachment) => void;
}

export interface ActionPopupProps {
	isMessageAuthor: boolean;
	messageId: number;
	channelId: number;
	onEdit: () => void;
	onReply: () => void;
	onForward: () => void;
	onDelete: () => void;
}

export interface AttachmentsProps {
	validAttachments: (Attachment & {
		url: string;
		filename: string;
		thumbUrl?: string;
	})[];
	loadedImages: Record<string, boolean>;
	isMessageAuthor: boolean;
	content: string | null;
	formattedTime: string;
	statusIcon: string;
	onImageLoad: (uuid: string) => void;
	onMediaClick: (index: number) => void;
}

export interface MessageContentProps {
	content: string | null;
	htmlContent: string;
	isMessageAuthor: boolean;
	showAuthorName: boolean;
	authorName: string;
	formattedTime: string;
	statusIcon: string;
	renderContent: (html: string | null | undefined) => JSX.Element[];
}

export interface AvatarProps {
	author: { user: APIUser };
	showAvatar: boolean;
	avatarBg: string;
	avatarInitial: string;
}

export interface ExtendedChatItemProps extends ChatItemProps {
	isCollapsed?: boolean;
}

export interface ExtendedChatListProps extends ChatListProps {
	isCollapsed?: boolean;
	channels?: APIChannel[];
}

export interface ChatAvatarProps {
	chat: APIChannel | CachedChat;
}

export interface CreateButtonProps {
	onClick: () => void;
}

export interface CreateDropdownProps {
	onSelect: (type: "group" | "channel") => void;
	onClose: () => void;
	registerCloseHandler?: (close: () => void) => void;
}

export interface SearchBarProps {
	onJoinChannel: (channelId: number | null) => Promise<void>;
}

export interface ButtonProps {
	children: ComponentChildren;
	width?: number | string;
	fontSize?: number | string;
	fontWeight?: number | string;
	height?: number | string;
	centerText?: boolean;
	onClick?: () => void | Promise<void>;
	variant?: "primary" | "secondary" | "danger" | "default" | "branded";
	icon?: string | undefined;
	disabled?: boolean;
	type?: "button" | "submit" | "reset";
	style?: JSX.CSSProperties;
	className?: string;
}

export interface TooltipProps {
	children: JSX.Element;
	text: string;
	className?: string;
	position?: "top" | "bottom" | "left" | "right" | "auto";
}

export interface DefaultAvatarProps {
	createdAt: number;
	displayName?: string;
	size?: "small" | "medium" | "large";
}

export interface MemberListProps {
	channelId: number;
}

export interface Gateway {
	on(event: "hello", listener: () => void): void;
	on(event: "closed", listener: (code: number) => void): void;
	on(event: "socketError", listener: (event: Event) => void): void;
	on(
		event: "dispatch",
		listener: (message: { t: string; d: unknown }) => void,
	): void;
}

export interface EventMap {
	connected: undefined;
	error: Error;
	close: CloseEvent;
	MESSAGE_CREATE: APIMessage;
	MESSAGE_DELETE: { id: number; channel_id: number };
	USER_UPDATE: APIUser;
	USER_STATUS_UPDATE: { user_id: number; status: number };
}

export interface ChatOverviewProps {
	channel: APIChannel;
	isOwner: boolean;
	visible?: boolean;
	className?: string;
}

export interface PageTransitionContextType {
	isTransitioning: boolean;
	startTransition: (to: string) => void;
}

export interface PageTransitionProviderProps {
	children: JSX.Element;
}
