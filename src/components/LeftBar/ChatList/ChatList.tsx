import { useEffect, useMemo, useState } from "preact/hooks";
import styles from "./ChatList.module.scss";
import ChatItem from "./ChatItem/ChatItem";
import { ChatListProps } from "@interfaces/interfaces";
import { APIChannel } from "@foxogram/api-types";
import { replaceEmojis } from "@utils/emoji";
import { observer } from "mobx-react";
import chatStore from "@store/chat";

const ChatListComponent = ({ chats, onSelectChat }: ChatListProps) => {
    const [noChatsMessage, setNoChatsMessage] = useState<string>("");

    const sortedChannels = useMemo(() => {
        return [...chatStore.channels]
            .filter((chat): chat is APIChannel => !!chat)
            .sort((a, b) => {
                const aTime = a.last_message?.created_at ?? a.created_at;
                const bTime = b.last_message?.created_at ?? b.created_at;
                return (bTime || 0) - (aTime || 0);
            });
    }, [chatStore.channels]);

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
                        isActive={chat.id === chatStore.currentChannelId}
                        onSelectChat={onSelectChat}
                        currentUser={chatStore.currentUserId ?? -1}
                    />
                ))}
        </div>
    );
};

const ChatList = observer(ChatListComponent);
export default ChatList;