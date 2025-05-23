import { useEffect, useMemo, useState } from "preact/hooks";
import styles from "./ChatList.module.scss";
import ChatItem from "./ChatItem/ChatItem";
import { ChatListProps } from "@interfaces/interfaces";
import { replaceEmojis } from "@utils/emoji";
import { observer } from "mobx-react";
import appStore from "@store/app";

const ChatListComponent = ({ chats, onSelectChat }: ChatListProps) => {
    const [noChatsMessage, setNoChatsMessage] = useState<string>("");

    const sortedChannels = useMemo(() => {
        return [...appStore.channels]
            .sort((a, b) => {
                const aTime = a.last_message?.created_at ?? a.created_at;
                const bTime = b.last_message?.created_at ?? b.created_at;
                return (bTime || 0) - (aTime || 0);
            });
    }, [appStore.channels]);

    useEffect(() => {
        const message = replaceEmojis("😔", "160");
        setNoChatsMessage(message);
    }, []);

    if (chats.length === 0) {
        return (
            <div className={styles.noChatsContainer}>
                <div
                    className={styles.emoji}
                    dangerouslySetInnerHTML={{ __html: noChatsMessage }}
                />
                <div className={styles.mainText}>Oops! There’s nothing to see</div>
                <div className={styles.subText}>Start a new chat?</div>
            </div>
        );
    }

    return (
        <div className={styles.chatList}>
            {sortedChannels
                .map(chat => (
                    <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === appStore.currentChannelId}
                        onSelectChat={onSelectChat}
                        currentUser={appStore.currentUserId ?? -1}
                    />
                ))}
        </div>
    );
};

const ChatList = observer(ChatListComponent);
export default ChatList;