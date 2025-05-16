import styles from "./EmptyState.module.css";
import { APIChannel } from "@foxogram/api-types";
import { EmptyStateProps } from "@interfaces/interfaces";


const EmptyState = ({ chats, onSelectChat, selectedChat }: EmptyStateProps) => {
    const handleChatClick = (chat: APIChannel) => {
        onSelectChat(chat);
    };

    const formatTimestamp = (timestamp: number): string => {
        const date = new Date(timestamp);

        const is12HourFormat = new Intl.DateTimeFormat("en-US", { hour12: true }).formatToParts(new Date()).some(part => part.type === "dayPeriod");

        const options: Intl.DateTimeFormatOptions = {
            hour: "2-digit",
            minute: "2-digit",
            hour12: is12HourFormat,
        };

        const formatter = new Intl.DateTimeFormat("en-US", options);
        return formatter.format(date);
    };

    const getInitial = (chat: APIChannel): string => {
        return ((chat.display_name[0] ?? chat.name[0]) ?? "?").toUpperCase();
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
                            onClick={() => { handleChatClick(chat); }}
                        >
                            <div className={styles["avatar"]}>
                                {chat.icon ? (
                                    <img
                                        src={chat.icon}
                                        alt={chat.name}
                                        className={styles["chat-avatar"]}
                                    />
                                ) : (
                                    <div className={styles["default-avatar"]}>
                                        {getInitial(chat)}
                                    </div>
                                )}
                            </div>
                            <div className={styles["chat-content"]}>
                                <span className={styles["username"]}>
                                    {chat.display_name || chat.name}
                                </span>
                                <span className={styles["message-preview"]}>
                                    {chat.last_message?.content && chat.last_message.content.length > 20
                                        ? `${chat.last_message.content.substring(0, 20)}...`
                                        : chat.last_message?.content}</span>
                            </div>
                            <span className={styles["timestamp"]}>
                                {chat.last_message
                                    ? formatTimestamp(chat.last_message.created_at)
                                    : "00:00"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles["glow"]} />
        </div>
    );
};

export default EmptyState;
