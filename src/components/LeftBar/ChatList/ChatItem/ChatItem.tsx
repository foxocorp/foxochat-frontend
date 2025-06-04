import { ExtendedChatItemProps } from "@interfaces/interfaces";
import { renderEmojisToJSX } from "@utils/emoji";
import { ChannelType } from "foxogram.js";
import { observer } from "mobx-react";
import ChatAvatar from "./ChatAvatar";
import * as styles from "./ChatItem.module.scss";

const ChatItemComponent = ({
	chat,
	onSelectChat,
	isActive,
	isCollapsed = false,
}: ExtendedChatItemProps) => {
	const lastMessage = chat.last_message;

	const lastMessageContent = !lastMessage
		? "No messages"
		: `${lastMessage.author.user.username || "Unknown"}: ${lastMessage.content.substring(0, 30)}${
				lastMessage.content.length > 30 ? "..." : ""
			}`;

	const chatItemClass = chat.type === ChannelType.DM ? styles.newsChannel : "";

	return (
		<div
			className={`${styles.chatItem} ${chatItemClass} ${isActive ? styles.activeChat : ""} ${
				isCollapsed ? styles.collapsed : ""
			}`}
			onClick={() => {
				onSelectChat(chat);
			}}
		>
			<ChatAvatar chat={chat} />
			{!isCollapsed && (
				<div className={styles.chatInfo}>
					<p className={styles.chatName}>
						{renderEmojisToJSX(chat.display_name || chat.name)}
					</p>
					<p className={styles.chatMessage}>{lastMessageContent}</p>
				</div>
			)}
		</div>
	);
};

export default observer(ChatItemComponent);
