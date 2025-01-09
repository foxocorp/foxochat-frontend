import styles from "./EmptyState.module.css";
import { Chat } from "../../../types/chatTypes";

interface EmptyStateProps {
    chats: Chat[];
    onSelectChat: (chat: Chat) => void;
    selectedChat: Chat | null;
}

const EmptyState = ({ chats, onSelectChat, selectedChat }: EmptyStateProps) => {
    const handleChatClick = (chat: Chat) => {
        onSelectChat(chat);
    };

    return (
        <div className={styles["empty-container"]}>
            <div className={styles["content"]}>
                <h1 className={styles["empty-header"]}>
                    Select a channel to start messaging
                </h1>
                <p className={styles["empty-subtext"]}>or check unread messages:</p>
                <div className={styles["chat-list"]}>
                    {chats.map((chat, index) => (
                        <div
                            key={index}
                            className={`${styles["chat-item"]} ${
                                selectedChat?.name === chat.name ? styles["selected"] : ""
                            }`}
                            onClick={() => handleChatClick(chat)}>
                            <div className={styles["avatar"]}>
                                {chat.avatar ? (
                                    <img
                                        src={chat.avatar}
                                        alt={chat.name}
                                        className={styles["chat-avatar"]}/>
                                ) : (
                                    <div className={styles["default-avatar"]}>
                                        {chat.displayName?.charAt(0).toUpperCase() ||
                                            chat.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className={styles["chat-content"]}>
                                <span className={styles["username"]}>
                                    {chat.displayName || chat.name}
                                </span>
                                <span className={styles["message-preview"]}>
                                    {chat.lastMessage.text.length > 20
                                        ? `${chat.lastMessage.text.substring(0, 20)}...`
                                        : chat.lastMessage.text}
                                </span>
                            </div>
                            <span className={styles["timestamp"]}>10:34</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles["glow"]}></div>
        </div>
    );
};

export default EmptyState;
