import type { ChatListProps } from "@interfaces/interfaces";
import appStore from "@store/app";
import { observer } from "mobx-react";
import { useCallback, useMemo } from "preact/compat";
import ChatItem from "./ChatItem/ChatItem";
import * as styles from "./ChatList.module.scss";

const ChatListComponent = ({ chats, isCollapsed = false, onOpenChat, onCreateChat }: ChatListProps) => {
	const sortedChannels = useMemo(() => {
		return [...chats].sort((a, b) => {
			const aTime = a.last_message?.created_at ?? a.created_at;
			const bTime = b.last_message?.created_at ?? b.created_at;
			return (bTime || 0) - (aTime || 0);
		});
	}, [chats]);

	const handleOpenChat = useCallback(onOpenChat || (() => {}), [onOpenChat]);
	const handleCreateChat = useCallback(onCreateChat || (() => {}), [onCreateChat]);

	if (chats.length === 0) {
		if (isCollapsed) return null;
		return (
			<div className={styles.noChatsContainer}>
				<div className={styles.mainText}>
					Can't find the right contact here?
				</div>
				<div className={styles.subText} onClick={handleCreateChat}>
					Create new chat
				</div>
			</div>
		);
	}

	return (
		<div className={`${styles.chatList} ${isCollapsed ? styles.collapsed : ""}`}>
			{sortedChannels.filter(chat => chat && chat.id != null).map((chat) => (
				<ChatItem
					key={chat.id}
					chat={chat}
					isActive={chat.id === appStore.currentChannelId}
					currentUser={appStore.currentUserId}
					isCollapsed={isCollapsed}
					onOpenChat={handleOpenChat}
				/>
			))}
		</div>
	);
};

export default observer(ChatListComponent);
