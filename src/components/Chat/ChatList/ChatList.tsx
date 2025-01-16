import styles from "./ChatList.module.css";
import ChatItem from "./ChatItem/ChatItem";
import { Channel } from "@types/chatTypes.ts";

interface ChatListProps {
    chats: Channel[];
    onSelectChat: (chat: Channel) => void;
    currentUser: number;
}

const ChatList = ({ chats, onSelectChat, currentUser }: ChatListProps) => {
    if (chats.length === 0) {
        return <div>No chats available</div>;
    }

    return (
        <div className={styles["chat-list"]}>
            {chats.map((chat, index) => (
                <div key={`${chat.name || "unknown"}-${chat.display_name || "unknown"}-${index}`}>
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
