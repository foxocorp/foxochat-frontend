import { useState, useEffect } from "preact/hooks";
import styles from "./ChatItem.module.scss";
import { replaceEmojis } from "@utils/emoji";
import { observer } from "mobx-react";
import { ChannelType } from "@foxogram/api-types";
import { ChatItemProps } from "@interfaces/interfaces";
import { timestampToHSV } from "@utils/functions";

const ChatItemComponent = ({ chat, onSelectChat, isActive }: ChatItemProps) => {
    const [emojiReplacedName, setEmojiReplacedName] = useState<string>("");

    const lastMessage = chat.last_message;

    const lastMessageContent = !lastMessage
        ? "No messages"
        : `${lastMessage.author.user.username || "Unknown"}: ${lastMessage.content.substring(0, 30)}${lastMessage.content.length > 30 ? "..." : ""}`;

    useEffect(() => {
        const replacedName = replaceEmojis(chat.display_name || chat.name, "64");
        setEmojiReplacedName(replacedName);
    }, [chat.display_name, chat.name]);

    const chatItemClass = chat.type === ChannelType.DM ? styles.newsChannel : "";

    const ts = chat.created_at;
    const { h, s } = timestampToHSV(ts);
    const v = 70;
    const backgroundColor = `hsl(${h}, ${s}%, ${v}%)`;

    const avatarContent = chat.icon ? (
        <img
            src={chat.icon}
            alt={chat.display_name || chat.name}
            className={styles.chatAvatar}
        />
    ) : (
        <div
            className={styles.defaultAvatar}
            style={{ backgroundColor }}
        >
            {(chat.display_name || chat.name).charAt(0).toUpperCase()}
        </div>
    );

    return (
        <div
            className={`${styles.chatItem} ${chatItemClass} ${isActive ? styles.activeChat : ""}`}
            onClick={() => { onSelectChat(chat); }}
        >
            {avatarContent}
            <div className={styles.chatInfo}>
                <p className={styles.chatName}>
                    {emojiReplacedName}
                </p>
                <p className={styles.chatMessage}>
                    {lastMessageContent}
                </p>
            </div>
        </div>
    );
};

const ChatItem = observer(ChatItemComponent);
export default ChatItem;
