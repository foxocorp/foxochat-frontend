import type { ComponentChild, ComponentChildren } from "preact";
import type React from "preact/compat";
import type { ContainerNode } from "preact";
import type { JSX } from "preact";

/* === Type Aliases === */
type APIChannel = any;
type APIMember = any;
type APIMessage = any;
type ChannelType = any;
type APIUser = any;

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
	currentUser: APIUser;
	isCollapsed?: boolean;
	channels?: APIChannel[];
	onOpenChat?: () => void;
	onCreateChat?: (e: MouseEvent) => void;
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
	setShowOverview: (value: boolean) => void;
}

export interface ChatItemProps {
	chat: APIChannel;
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
	selectedChat: APIChannel | null;
}

export interface SidebarProps {
	currentUser: APIUser;
	isMobile?: boolean;
	setMobileView?: (view: "list" | "chat") => void;
	setChatTransition?: (transition: string) => void;
	activeTab?: "chats" | "settings" | "contacts";
	onTabChange?: (tab: "chats" | "settings" | "contacts") => void;
	selectedSection?: string;
	onSelectSection?: (section: string) => void;
}

export interface SidebarFooterProps {
	active?: "contacts" | "chats" | "settings";
	onNav?: (nav: "contacts" | "chats" | "settings") => void;
	isMobile?: boolean;
	className?: string;
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

export interface ChatAvatarProps {
	chat: APIChannel;
}

export interface CreateButtonProps {
	onClick: () => void;
}

export interface CreateDropdownProps {
	onSelect: (type: "group" | "channel") => void;
	onClose: () => void;
	registerCloseHandler?: (close: () => void) => void;
	x?: number | undefined;
	y?: number | undefined;
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
	show?: boolean;
}

export interface DefaultAvatarProps {
	createdAt: number;
	username?: string;
	size?: "small" | "medium" | "large" | "fill";
	square?: boolean;
}

export interface MemberListProps {
	members: APIMember[];
	loading: boolean;
	error: string | null;
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

export interface ProfileSettingsProps {
	currentUser: APIUser;
}

export interface EditableFieldProps {
	label: string;
	value: string;
	field: "display_name" | "bio" | "username" | "email";
	loading: boolean;
	onSave: (field: string, value: string) => Promise<void>;
	user?: APIUser;
	asAt?: string;
}

export interface SettingsProps {
	currentUser: APIUser;
	selectedSection?: string;
	onSelectSection?: (section: string) => void;
	isMobile?: boolean;
	showFooter?: boolean;
	className?: string;
	onTabChange?: (tab: "chats" | "settings" | "contacts") => void;
}

export interface MobileSettingsProps {
	currentUser: APIUser;
	selectedSection?: string;
	onSelectSection?: (section: string) => void;
	onTabChange?: (tab: "chats" | "settings" | "contacts") => void;
}

export interface SettingsHomeProps {
	selected: string;
	onSelect: (key: string) => void;
	currentUser: APIUser;
	isMobile?: boolean;
}

export interface ModalProps {
	title: string;
	description: string;
	onClose: () => void;
	actionButtons?: JSX.Element[];
	icon?: string | undefined;
}

export interface PageProps {
	children: import("preact").ComponentChildren;
	center?: boolean;
}

export interface SpoilerOverlayProps {
	visible: boolean;
	onReveal: () => void;
	originalImage?: HTMLImageElement | null;
	blurRadius?: number;
	animationDuration?: number;
}

export interface PublicProfileCardProps {
	user: APIUser;
}

export interface SectionHeaderProps {
	section: string;
	title: string;
	isMobile?: boolean;
}

export interface PasswordResetModalProps {
	isOpen: boolean;
	email: string;
	onClose: () => void;
	onSendEmail: (email: string) => Promise<any>;
	onVerifyCode: (code: string) => Promise<any>;
	onResetPassword: (password: string) => Promise<any | undefined>;
	onResendCode: () => Promise<any>;
}

export interface ColorPickerProps {
	color: string;
	onChange: (color: string) => void;
	label: string;
	resetText?: string;
	onReset?: () => void;
	showReset?: boolean;
}

/**
 * Context Menu Interfaces
 */
export interface ContextMenuItem {
	icon?: JSX.Element;
	label?: string;
	onClick?: () => void;
	danger?: boolean;
	disabled?: boolean;
	divider?: boolean;
}

export interface ContextMenuProps {
	x: number;
	y: number;
	items: ContextMenuItem[];
	onClose: () => void;
}

/**
 * Email Confirmation Modal Interface
 */
export interface EmailConfirmationModalProps {
	isOpen: boolean;
	email: string;
	onClose: () => void;
	onVerify: (code: string) => Promise<void>;
	onResendCode: () => Promise<void>;
}

/**
 * Chat Header With Counts Interface
 */
export interface ChatHeaderPropsWithCounts extends ChatHeaderProps {
	participantsCount?: number;
	onlineCount?: number;
}

/**
 * Left Bar Chat Header Interface
 */
export interface LeftBarChatHeaderProps {
	currentUser: any;
	onEdit?: () => void;
	onAdd?: (e: MouseEvent) => void;
	title?: string;
}

/**
 * Search Bar Interface
 */
export interface SearchBarProps {
	onJoinChannel?: (channelId: number | null) => void;
}

/**
 * Empty Chat Interface
 */
export interface EmptyChatProps {
	channel?: {
		type: ChannelType;
		name: string;
		display_name?: string;
		username?: string;
		avatar?: { uuid: string };
		created_at: number;
		status?: number;
	};
}

/**
 * Type Or Status Badge Interface
 */
export interface TypeOrStatusBadgeProps {
	type: ChannelType;
	isOnline?: boolean;
}

/**
 * Extended Chat Avatar Interface
 */
export interface ExtendedChatAvatarProps extends ChatAvatarProps {
	isOnline?: boolean | undefined;
	currentUserId?: number | null;
}

/**
 * Chat Item With Mobile Interface
 */
export interface ChatItemWithMobileProps extends ExtendedChatItemProps {
	onOpenChat?: () => void;
}

/**
 * Empty Contacts Interface
 */
export interface EmptyContactsProps {
	onCreateChat?: ((e: MouseEvent) => void) | undefined;
}

/**
 * Contacts List Interface
 */
export interface ContactsListProps {
	chats: APIChannel[];
	currentUser: APIUser;
	onCreateChat?: (e: MouseEvent) => void;
}
