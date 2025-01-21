import { useState } from "react";
import styles from "./ChatList.module.css";
import ChatItem from "./ChatItem/ChatItem";
import { ChatListProps, Channel } from "@interfaces/chat.interface.ts";

const ChatList = ({ chats, onSelectChat, currentUser }: ChatListProps) => {
    const [activeChat, setActiveChat] = useState<string | null>(null);

    const handleSelectChat = (chat: Channel) => {
        setActiveChat(chat.name);
        onSelectChat(chat);
    };

    if (chats.length === 0) {
        return <div>No chats available</div>;
    }

    return (
        <div className={styles["chat-list"]}>
            {chats.map((chat, index) => (
                <ChatItem
                    key={`${chat.name || "unknown"}-${chat.display_name || "unknown"}-${index}`}
                    chat={chat}
                    onSelectChat={handleSelectChat}
                    currentUser={currentUser}
                    isActive={chat.name === activeChat}
                />
            ))}
        </div>
    );
};

export default ChatList;
