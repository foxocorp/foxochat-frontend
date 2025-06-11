import ChannelIcon from "@icons/navigation/channel.svg";
import GroupIcon from "@icons/navigation/group.svg";
import { ExtendedChatItemProps } from "@interfaces/interfaces";
import { renderEmojisToJSX } from "@utils/emoji";
import { ChannelType } from "foxochat.js";
import { toJS } from "mobx";
import { observer } from "mobx-react";
import ChatAvatar from "./ChatAvatar";
import * as styles from "./ChatItem.module.scss";

const ChatItemComponent = ({
	chat,
	onSelectChat,
	isActive,
	isCollapsed = false,
	currentUser,
}: ExtendedChatItemProps) => {
	const lastMessage = chat.last_message;
	const rawChat = toJS(chat);

	const isCurrentUserAuthor = lastMessage?.author?.user?.id === currentUser;

	const authorName = isCurrentUserAuthor ? (
		<span className={styles.chatMessageAuthor}>You:</span>
	) : (
		<span className={styles.chatMessageAuthor}>
			{lastMessage?.author?.user?.username || "Unknown"}:
		</span>
	);

	const lastMessageContent = lastMessage ? (
		<>
			{authorName} {lastMessage.content.substring(0, 30)}
			{lastMessage.content.length > 30 ? "..." : ""}
		</>
	) : (
		"No messages"
	);

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

	return (
		<div
			className={`${styles.chatItem} ${isActive ? styles.activeChat : ""} ${
				isCollapsed ? styles.collapsed : ""
			}`}
			onClick={() => {
				onSelectChat(chat);
			}}
		>
			<ChatAvatar chat={chat} />
			{!isCollapsed && (
				<div className={styles.chatInfo}>
					<div className={styles.chatNameWrapper}>
						{getIcon()}
						<span className={styles.chatName}>
							{renderEmojisToJSX(chat.name)}
						</span>
					</div>
					<div className={styles.chatMessage}>{lastMessageContent}</div>
				</div>
			)}
		</div>
	);
};

export default observer(ChatItemComponent);
