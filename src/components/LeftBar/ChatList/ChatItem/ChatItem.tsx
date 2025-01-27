import { ChatItemProps } from "@interfaces/chat.interface.ts";
import styles from "./ChatItem.module.css";
import { replaceEmojis } from "@utils/emoji.ts";
import { observer } from "mobx-react";
import { ChannelType } from "@foxogram/api-types";
import { useMemo } from "preact/hooks";

const ChatItem = observer(({ chat, onSelectChat, currentUser, isActive }: ChatItemProps) => {
    const { lastMessageContent } = useMemo(() => {
        const lastMessage = chat.lastMessage;

        const authorName = lastMessage?.author.user.username ?? "Unknown user";
        const isCurrentUserAuthor = lastMessage?.author.id === currentUser;

        return {
            lastMessageContent: lastMessage
                ? isCurrentUserAuthor
                    ? `You: ${lastMessage.content}`
                    : `${authorName}: ${lastMessage.content}`
                : "No messages",
        };
    }, [chat.lastMessage, currentUser]);

    const chatItemClass = chat.type === ChannelType.DM
        ? styles["news-channel"]
        : "";

    const avatarContent = useMemo(() => {
        if (chat.icon) {
            return (
                <img
                    src={chat.icon}
                    alt={chat.display_name || chat.name}
                    className={styles["chat-avatar"]}
                />
            );
        }
        return (
            <div className={styles["default-avatar"]}>
                {(chat.display_name || chat.name).charAt(0).toUpperCase()}
            </div>
        );
    }, [chat.icon, chat.display_name, chat.name]);

    return (
        <div
            className={`${styles["chat-item"]} ${chatItemClass} ${isActive ? styles["active-chat"] : ""}`}
            onClick={() => { onSelectChat(chat); }}
        >
            {avatarContent}
            <div className={styles["chat-info"]}>
                <p className={styles["chat-name"]}>
                    {replaceEmojis(chat.display_name || chat.name, "64")}
                </p>
                <p className={styles["chat-message"]}>
                    {lastMessageContent}
                </p>
            </div>
        </div>
    );
});

export default ChatItem;