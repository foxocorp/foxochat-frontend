import { useState, useMemo } from "react";
import styles from "./ChatList.module.css";
import ChatItem from "./ChatItem/ChatItem";
import { ChatListProps, Channel } from "@interfaces/chat.interface.ts";
import { replaceEmojis } from "@utils/emoji.ts";
import { observer } from "mobx-react";

const ChatList = observer(({ chats, currentUser, onSelectChat }: ChatListProps) => {
    const [activeChatId, setActiveChatId] = useState<number | null>(null);

    const handleSelectChat = (chat: Channel) => {
        setActiveChatId(chat.id);
        onSelectChat(chat);
    };

    const noChatsMessage = useMemo(async () => {
        return await replaceEmojis("😔", "160");
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
            {chats.map(chat => (
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
});

export default ChatList;