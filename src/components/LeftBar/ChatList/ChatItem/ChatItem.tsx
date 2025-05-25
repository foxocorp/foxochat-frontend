import { useState, useEffect } from "preact/hooks";
import styles from "./ChatItem.module.scss";
import { replaceEmojis } from "@utils/emoji";
import { observer } from "mobx-react";
import { ChannelType } from "@foxogram/api-types";
import { ChatItemProps } from "@interfaces/interfaces";
import ChatAvatar from "./ChatAvatar";

interface ExtendedChatItemProps extends ChatItemProps {
    isCollapsed?: boolean;
}

const ChatItemComponent = ({
                               chat,
                               onSelectChat,
                               isActive,
                               isCollapsed = false,
                           }: ExtendedChatItemProps) => {
    const [emojiReplacedName, setEmojiReplacedName] = useState("");

    const lastMessage = chat.last_message;

    const lastMessageContent = !lastMessage
        ? "No messages"
        : `${lastMessage.author.user.username || "Unknown"}: ${lastMessage.content.substring(0, 30)}${
            lastMessage.content.length > 30 ? "..." : ""
        }`;

    useEffect(() => {
        const replacedName = replaceEmojis(chat.display_name || chat.name, "64");
        setEmojiReplacedName(replacedName);
    }, [chat.display_name, chat.name]);

    const chatItemClass = chat.type === ChannelType.DM ? styles.newsChannel : "";

    return (
        <div
            className={`${styles.chatItem} ${chatItemClass} ${isActive ? styles.activeChat : ""} ${
                isCollapsed ? styles.collapsed : ""
            }`}
            onClick={() => {
                onSelectChat(chat);
            }}
        >
            <ChatAvatar chat={chat} />
            {!isCollapsed && (
                <div className={styles.chatInfo}>
                    <p className={styles.chatName}>{emojiReplacedName}</p>
                    <p className={styles.chatMessage}>{lastMessageContent}</p>
                </div>
            )}
        </div>
    );
};

export default observer(ChatItemComponent);