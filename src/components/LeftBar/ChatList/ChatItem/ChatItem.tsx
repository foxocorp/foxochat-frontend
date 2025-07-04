import ContextMenu from "@components/Base/ContextMenu/ContextMenu";
import { useContextMenu } from "@components/Base/ContextMenu/useContextMenu";
import type { ExtendedChatItemProps } from "@interfaces/interfaces";
import { apiMethods } from "@services/API/apiMethods";
import appStore from "@store/app";
import { renderEmojisToJSX } from "@utils/emoji";
import { ChannelType } from "foxochat.js";
import { toJS } from "mobx";
import { observer } from "mobx-react";
import type React from "preact/compat";
import { useEffect, useMemo, useState } from "preact/hooks";
import ChannelIcon from "@/assets/icons/left-bar/chat-list/channel.svg";
import GroupIcon from "@/assets/icons/left-bar/chat-list/group.svg";
import EditIcon from "@/assets/icons/right-bar/chat/chat-overview/edit.svg";
import MarkAsReadIcon from "@/assets/icons/right-bar/chat/chat-overview/mark-as-read.svg";
import MuteIcon from "@/assets/icons/right-bar/chat/chat-overview/mute.svg";
import PinIcon from "@/assets/icons/right-bar/chat/chat-overview/pin.svg";
import PreviewIcon from "@/assets/icons/right-bar/chat/chat-overview/preview.svg";
import TrashIcon from "@/assets/icons/right-bar/chat/chat-overview/trash.svg";
import CheckMarkRead from "@/assets/icons/status/check-mark-read.svg";
import { config } from "@/lib/config/endpoints";
import { fetchFileAndGenerateThumbHash } from "@/utils/functions";
import { ChatAvatar } from "./ChatAvatar";
import * as styles from "./ChatItem.module.scss";

const ChatItemComponent = ({
	chat,
	isActive,
	isCollapsed = false,
	currentUser,
}: ExtendedChatItemProps) => {
	const lastMessage = chat.last_message;
	const rawChat = toJS(chat);
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
		return <img src={CheckMarkRead} alt="Read" className={styles.statusIcon} />;
	};

	const renderMessagePreview = () => {
		if (!lastMessage) return "No messages";
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

	const getIcon = () => {
		switch (rawChat.type) {
			case ChannelType.Group:
				return (
					<img
						src={GroupIcon}
						alt="Group icon"
						className={styles.channelTypeIcon}
					/>
				);
			case ChannelType.Channel:
				return (
					<img
						src={ChannelIcon}
						alt="Channel icon"
						className={styles.channelTypeIcon}
					/>
				);
			default:
				return null;
		}
	};

	const contextMenu = useContextMenu();

	const isOwner = chat.owner?.id === currentUser;

	const handleClick = () => {
		appStore.setCurrentChannel(chat.id);
		window.history.replaceState(null, "", `/channels/#${chat.id}`);
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
			...(isOwner
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
				<ChatAvatar chat={chat} />
				{!isCollapsed && (
					<div className={styles.chatInfo}>
						<div className={styles.chatNameWrapper}>
							{getIcon()}
							<span className={styles.chatName}>
								{renderEmojisToJSX(nameToDisplay)}
							</span>
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
