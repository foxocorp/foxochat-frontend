import { useState, useEffect, useMemo } from "preact/hooks";

import styles from "./ChatItem.module.css";
import { replaceEmojis } from "@utils/emoji";
import { observer } from "mobx-react";
import { ChannelType } from "@foxogram/api-types";
import { ChatItemProps } from "@interfaces/interfaces";

const ChatItemComponent = ({ chat, onSelectChat, currentUser, isActive }: ChatItemProps) => {
    const [emojiReplacedName, setEmojiReplacedName] = useState<string>("");

    const lastMessageContent = useMemo(() => {
        const lastMessage = chat.last_message;
        const authorName = lastMessage?.author.user.username ?? "Unknown user";
        const isCurrentUserAuthor = lastMessage?.author.id === currentUser;

        return lastMessage
            ? isCurrentUserAuthor
                ? `You: ${lastMessage.content}`
                : `${authorName}: ${lastMessage.content}`
            : "No messages";
    }, [chat.last_message, currentUser]);

    useEffect(() => {
        const replacedName = replaceEmojis(chat.display_name || chat.name, "64");
        setEmojiReplacedName(replacedName);
    }, [chat.display_name, chat.name]);

    const chatItemClass = chat.type === ChannelType.DM ? styles["news-channel"] : "";

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
                    {emojiReplacedName}
                </p>
                <p className={styles["chat-message"]}>
                    {lastMessageContent}
                </p>
            </div>
        </div>
    );
};

const ChatItem = observer(ChatItemComponent);
export default ChatItem;