import { useEffect, useMemo, useState } from "preact/hooks";

import styles from "./ChatList.module.css";
import ChatItem from "./ChatItem/ChatItem";
import { Channel, ChatListProps } from "@interfaces/interfaces";
import { replaceEmojis } from "@utils/emoji";
import { observer } from "mobx-react";

const ChatListComponent = ({ chats, currentUser, onSelectChat }: ChatListProps) => {
    const [activeChatId, setActiveChatId] = useState<number | null>(null);
    const [noChatsMessage, setNoChatsMessage] = useState<string>("");

    const sortedChannels = useMemo(() => {
        return [...chats].sort((a, b) => {
            const aTime = a.lastMessage?.created_at ?? a.created_at;
            const bTime = b.lastMessage?.created_at ?? b.created_at;
            return bTime - aTime;
        });
    }, [chats.length, chats]);

    const handleSelectChat = (chat: Channel) => {
        setActiveChatId(chat.id);
        onSelectChat(chat);
    };

    useEffect(() => {
        const message = replaceEmojis("😔", "160");
        setNoChatsMessage(message);
    }, []);

    if (chats.length === 0) {
        return (
            <div className={styles["no-chats-container"]}>
                <div
                    className={styles["emoji"]}
                    dangerouslySetInnerHTML={{ __html: noChatsMessage }}
                />
                <div className={styles["main-text"]}>Oops! There’s nothing to see</div>
                <div className={styles["sub-text"]}>Start a new chat?</div>
            </div>
        );
    }

    return (
        <div className={styles["chat-list"]}>
            {sortedChannels.map(chat => (
                <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChatId}
                    onSelectChat={handleSelectChat}
                    currentUser={currentUser}
                />
            ))}
        </div>
    );
};

const ChatList = observer(ChatListComponent);
export default ChatList;