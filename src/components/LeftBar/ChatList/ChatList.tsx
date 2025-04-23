import { useEffect, useMemo, useState } from "preact/hooks";
import styles from "./ChatList.module.css";
import ChatItem from "./ChatItem/ChatItem";
import { ChatListProps } from "@interfaces/interfaces";
import { APIChannel } from "@foxogram/api-types";
import { replaceEmojis } from "@utils/emoji";
import { observer } from "mobx-react";
import chatStore from "@store/chat";

const ChatListComponent = ({ chats, currentUser, onSelectChat }: ChatListProps) => {
    const [noChatsMessage, setNoChatsMessage] = useState<string>("");

    const sortedChannels = useMemo(() => {
        return [...chatStore.channels].sort((a, b) => {
            const aTime = a?.last_message?.created_at ?? a?.created_at ?? 0;
            const bTime = b?.last_message?.created_at ?? b?.created_at ?? 0;
            return bTime - aTime;
        });
    }, [chatStore.channels.length]);

    const handleSelectChat = (chat: APIChannel) => {
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

    const activeChatId = chatStore.currentChannelId;

    return (
        <div className={styles["chat-list"]}>
            {sortedChannels
                .filter((chat): chat is APIChannel => chat !== null)
                .map(chat => (
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