import { ChatItemProps } from "@interfaces/chat.interface.ts";
import styles from "./ChatItem.module.css";


const ChatItem = ({ chat, onSelectChat, currentUser }: ChatItemProps) => {
    const formatLastMessage = () => {
        const lastMessage = chat.lastMessage;
        console.log(chat)

        if (!lastMessage || !lastMessage.author || !lastMessage.author.user) {
            return <span className={styles["message-text"]}>No messages yet</span>;
        }

        const { content, author } = lastMessage;

        const isCurrentUser = author.id === currentUser;
        const messagePrefix = isCurrentUser ? "You: " : `${author.user.username || 'Unknown'}: `;

        return (
            <>
                <span className={styles["you-text"]}>{messagePrefix}</span>
                <span className={styles["message-text"]}>{content}</span>
            </>
        );
    };

    const chatItemClass = chat.type === 1 ? styles["news-channel"] : "";

    return (
        <div
            className={`${styles["chat-item"]} ${chatItemClass}`}
            onClick={() => onSelectChat(chat)}
        >
            {chat.icon ? (
                <img src={chat.icon} alt={chat.name} className={styles["chat-avatar"]} />
            ) : (
                <div className={styles["default-avatar"]}>
                    {chat.name.charAt(0).toUpperCase()}
                </div>
            )}
            <div className={styles["chat-info"]}>
                <p className={styles["chat-name"]}>
                    {chat.display_name || chat.name}
                </p>
                <p className={styles["chat-message"]}>{formatLastMessage()}</p>
            </div>
        </div>
    );
};

export default ChatItem;
