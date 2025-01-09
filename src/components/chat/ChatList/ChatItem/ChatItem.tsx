import { Chat } from "../../../../types/chatTypes.ts";
import styles from "./ChatItem.module.css";

interface ChatItemProps {
    chat: Chat;
    onSelectChat: (chat: Chat) => void;
    currentUser: string;
}

const ChatItem = ({ chat, onSelectChat, currentUser }: ChatItemProps) => {
    const formatLastMessage = () => {
        let messagePrefix = "";
        let messageContent = "";

        if (chat.isGroup) {
            messagePrefix = `${chat.lastMessage.sender}: `;
            messageContent = chat.lastMessage.text;
        } else if (chat.isChannel) {
            messagePrefix = "";
            messageContent = chat.lastMessage.text;
        } else {
            if (chat.lastMessage.senderId === currentUser) {
                messagePrefix = "You: ";
                messageContent = chat.lastMessage.text;
            } else {
                messagePrefix = `${chat.lastMessage.sender}: `;
                messageContent = chat.lastMessage.text;
            }
        }

        return (
            <>
                <span className={styles["you-text"]}>{messagePrefix}</span>
                <span className={styles["message-text"]}>{messageContent}</span>
            </>
        );
    };

    const chatItemClass = chat.isChannel ? styles["news-channel"] : "";

    return (
        <div
            className={`${styles["chat-item"]} ${chatItemClass}`}
            onClick={() => onSelectChat(chat)}
        >
            {chat.avatar ? (
                <img src={chat.avatar} alt={chat.name} className={styles["chat-avatar"]} />
            ) : (
                <div className={styles["default-avatar"]}>
                    {chat.name.charAt(0).toUpperCase()}
                </div>
            )}
            <div className={styles["chat-info"]}>
                <p className={styles["chat-name"]}>
                    {chat.displayName || chat.name}
                </p>
                <p className={styles["chat-message"]}>{formatLastMessage()}</p>
            </div>
        </div>
    );
};

export default ChatItem;
