import styles from "./ChatList.module.css";
import ChatItem from "./ChatItem/ChatItem.tsx";
import { Chat } from "../../../types/chatTypes.ts";

interface ChatListProps {
    chats: Chat[];
    onSelectChat: (chat: Chat) => void;
    currentUser: string;
}

const ChatList = ({ chats, onSelectChat, currentUser }: ChatListProps) => {
    if (chats.length === 0) {
        return <div>No chats available</div>;
    }

    return (
        <div className={styles["chat-list"]}>
            {chats.map((chat, index) => (
                <div key={`${chat.name || "unknown"}-${chat.displayName || "unknown"}-${index}`}>
                    <ChatItem
                        chat={chat}
                        onSelectChat={onSelectChat}
                        currentUser={currentUser}
                    />
                </div>
            ))}
        </div>
    );
};

export default ChatList;
