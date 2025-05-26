import { ChatListProps } from "@interfaces/interfaces";
import appStore from "@store/app";
import { renderEmojisToJSX } from "@utils/emoji";
import { observer } from "mobx-react";
import { useMemo } from "preact/hooks";
import ChatItem from "./ChatItem/ChatItem";
import styles from "./ChatList.module.scss";

interface ExtendedChatListProps extends ChatListProps {
	isCollapsed?: boolean;
}

const ChatListComponent = ({
	chats,
	onSelectChat,
	isCollapsed = false,
}: ExtendedChatListProps) => {
	const sortedChannels = useMemo(() => {
		return [...appStore.channels].sort((a, b) => {
			const aTime = a.last_message?.created_at ?? a.created_at;
			const bTime = b.last_message?.created_at ?? b.created_at;
			return (bTime || 0) - (aTime || 0);
		});
	}, [appStore.channels.length]);

	if (chats.length === 0) {
		if (isCollapsed) return null;

		return (
			<div className={styles.noChatsContainer}>
				<div>{renderEmojisToJSX("😔", "160")}</div>
				<div className={styles.mainText}>Oops! There’s nothing to see</div>
				<div className={styles.subText}>Start a new chat?</div>
			</div>
		);
	}

	return (
		<div
			className={`${styles.chatList} ${isCollapsed ? styles.collapsed : ""}`}
		>
			{sortedChannels.map((chat) => (
				<ChatItem
					key={chat.id}
					chat={chat}
					isActive={chat.id === appStore.currentChannelId}
					onSelectChat={onSelectChat}
					currentUser={appStore.currentUserId ?? -1}
					isCollapsed={isCollapsed}
				/>
			))}
		</div>
	);
};

export default observer(ChatListComponent);
