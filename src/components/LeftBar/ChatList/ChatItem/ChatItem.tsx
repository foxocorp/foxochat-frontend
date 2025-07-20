import ContextMenu from "@components/Base/ContextMenu/ContextMenu";
import { useContextMenu } from "@components/Base/ContextMenu/useContextMenu";
import type { ChatItemWithMobileProps } from "@interfaces/interfaces";
import { apiMethods } from "@services/API/apiMethods";
import appStore from "@store/app";
import { renderEmojisToJSX } from "@utils/emoji";
import { ChannelType } from "foxochat.js";
import { observer } from "mobx-react";
import type React from "preact/compat";
import { useEffect, useMemo, useState } from "preact/hooks";
import EditIcon from "@/assets/icons/right-bar/chat/chat-overview/edit.svg";
import MarkAsReadIcon from "@/assets/icons/right-bar/chat/chat-overview/mark-as-read.svg";
import MuteIcon from "@/assets/icons/right-bar/chat/chat-overview/mute.svg";
import PinIcon from "@/assets/icons/right-bar/chat/chat-overview/pin.svg";
import PreviewIcon from "@/assets/icons/right-bar/chat/chat-overview/preview.svg";
import TrashIcon from "@/assets/icons/right-bar/chat/chat-overview/trash.svg";
import CheckMarkRead from "@/assets/icons/status/check-mark-read.svg?react";
import { config } from "@/lib/config/endpoints";
import { fetchFileAndGenerateThumbHash } from "@/utils/functions";
import { ChatAvatar } from "./ChatAvatar";
import * as styles from "./ChatItem.module.scss";

const ChatItemComponent = ({
	chat,
	isActive,
	isCollapsed = false,
	currentUser,
	onOpenChat,
}: ChatItemWithMobileProps) => {
	const lastMessage = chat.last_message;
	const nameToDisplay = chat.display_name || chat.name;

	const isCurrentUserAuthor = lastMessage?.author?.user?.id === currentUser;

	const authorName = isCurrentUserAuthor ? (
		<span className={styles.chatMessageAuthor}>You:</span>
	) : (
		<span className={styles.chatMessageAuthor}>
			{lastMessage?.author?.user?.username || "Unknown"}:
		</span>
	);

	const [thumbUrl, setThumbUrl] = useState<string | null>(null);

	const getPreviewType = () => {
		if (!lastMessage) return "none";
		if (lastMessage.attachments && lastMessage.attachments.length > 0) {
			const first = lastMessage.attachments[0];
			if (
				first &&
				first.content_type &&
				first.content_type.startsWith("image/")
			)
				return "image";
			return "file";
		}
		if (/```|\n {4}|\n\t/.test(lastMessage.content)) return "markdown";
		return "text";
	};

	const previewType = getPreviewType();

	useEffect(() => {
		if (previewType === "image" && lastMessage?.attachments?.length) {
			const att = lastMessage.attachments[0];
			if (!att) {
				setThumbUrl(null);
				return;
			}
			const url = `${config.cdnBaseUrl}${att.uuid}`;
			fetchFileAndGenerateThumbHash(url, att.content_type).then((hash) => {
				if (hash) {
					try {
						const binaryString = atob(hash);
						const bytes = new Uint8Array(binaryString.length);
						for (let i = 0; i < binaryString.length; i++) {
							bytes[i] = binaryString.charCodeAt(i);
						}
						const { thumbHashToDataURL } = require("thumbhash");
						setThumbUrl(thumbHashToDataURL(bytes));
					} catch {
						setThumbUrl(url);
					}
				} else {
					setThumbUrl(url);
				}
			});
		} else {
			setThumbUrl(null);
		}
	}, [lastMessage, previewType]);

	const formattedTime = useMemo(() => {
		if (!lastMessage?.created_at) return "";
		const date = new Date(lastMessage.created_at);
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	}, [lastMessage]);

	const getStatusIcon = () => {
		if (!isCurrentUserAuthor || !lastMessage) return null;
		return <CheckMarkRead className={styles.statusIcon} />;
	};

	const renderMessagePreview = () => {
		if (!lastMessage) {
			if (isDM) {
				return chat.name || "Unknown";
			}
			return "No messages yet";
		}
		if (previewType === "file")
			return (
				<>
					{authorName} <span className={styles.previewTag}>[File]</span>
				</>
			);
		if (previewType === "markdown")
			return (
				<>
					{authorName} <span className={styles.previewTag}>[Markdown]</span>
				</>
			);
		if (previewType === "image" && thumbUrl) {
			return (
				<>
					{authorName}{" "}
					<img src={thumbUrl} alt="preview" className={styles.previewImage} />
					{lastMessage.content && lastMessage.content.trim() && (
						<span className={styles.previewImageText}>
							{lastMessage.content.substring(0, 19)}
							{lastMessage.content.length > 30 ? "..." : ""}
						</span>
					)}
				</>
			);
		}
		return (
			<>
				{authorName} {lastMessage.content.substring(0, 19)}
				{lastMessage.content.length > 30 ? "..." : ""}
			</>
		);
	};

	const contextMenu = useContextMenu();

	const isOwner = chat.owner?.id === currentUser;
	const isDM = chat.type === ChannelType.DM;

	const getIsOnline = () => {
		if (!isDM) return false;

		const otherUserId = chat.recipients?.[0]?.user?.id;
		if (!otherUserId) return false;

		const userStatus = appStore.userStatuses.get(otherUserId);
		if (userStatus !== undefined) {
			return userStatus === 1;
		}

		const user = appStore.users.find((u) => u.id === otherUserId);
		return user?.status === 1;
	};

	const isOnline = getIsOnline();

	const handleClick = () => {
		void appStore.setCurrentChannel(chat.id);
		window.history.replaceState(null, "", `/channels/#${chat.id}`);
		if (onOpenChat) onOpenChat();
	};

	const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		const items = [
			{
				icon: <img src={PinIcon} alt="Pin" />,
				label: "Pin",
				onClick: () => {
					/* TODO: pin logic */
				},
			},
			...(isOwner && !isDM
				? [
						{
							icon: <img src={EditIcon} alt="Edit" />,
							label: "Edit",
							onClick: () => {
								/* TODO: edit logic */
							},
						},
					]
				: []),
			{ divider: true },
			{
				icon: <img src={MuteIcon} alt="Mute" />,
				label: "Mute",
				onClick: () => {
					/* TODO: mute logic */
				},
			},
			{
				icon: <img src={MarkAsReadIcon} alt="Mark as read" />,
				label: "Mark as read",
				onClick: () => {
					/* TODO: mark as read logic */
				},
			},
			{
				icon: <img src={PreviewIcon} alt="Preview" />,
				label: "Preview",
				onClick: () => {
					/* TODO: preview logic */
				},
			},
			{ divider: true },
			isOwner
				? {
						icon: <img src={TrashIcon} alt="Delete" />,
						label: "Delete",
						onClick: () => apiMethods.deleteChannel(chat.id),
						danger: true,
					}
				: {
						icon: <img src={TrashIcon} alt="Leave" />,
						label: "Leave",
						onClick: () => apiMethods.leaveChannel(chat.id),
						danger: true,
					},
		];
		contextMenu.open(e.clientX, e.clientY, items);
	};

	return (
		<>
			<div
				className={`${styles.chatItem} ${isActive ? styles.activeChat : ""} ${
					isCollapsed ? styles.collapsed : ""
				}`}
				onClick={handleClick}
				onContextMenu={handleContextMenu}
			>
				<ChatAvatar
					chat={chat}
					isOnline={isOnline}
					currentUserId={currentUser ?? null}
				/>
				{!isCollapsed && (
					<div className={styles.chatInfo}>
						<div className={styles.chatNameWrapper}>
							<span className={styles.chatName}>
								{renderEmojisToJSX(nameToDisplay, true)}
							</span>
							{isDM && chat.display_name && chat.display_name !== chat.name && (
								<span className={styles.chatUsername}>@{chat.name}</span>
							)}
						</div>
						<div className={styles.chatMessageRow}>
							<span className={styles.chatMessagePreview}>
								{renderMessagePreview()}
							</span>
							<span className={styles.chatMeta}>
								<span className={styles.chatTime}>{formattedTime}</span>
								<span className={styles.chatStatus}>{getStatusIcon()}</span>
							</span>
						</div>
					</div>
				)}
			</div>
			{contextMenu.isOpen && (
				<ContextMenu
					x={contextMenu.x}
					y={contextMenu.y}
					items={contextMenu.items}
					onClose={contextMenu.close}
				/>
			)}
		</>
	);
};

export default observer(ChatItemComponent);
