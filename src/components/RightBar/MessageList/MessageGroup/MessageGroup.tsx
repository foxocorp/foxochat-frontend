import { useState, useEffect } from "preact/hooks";
import MessageItem from "@components/RightBar/MessageList/MessageGroup/MessageItem/MessageItem";
import styles from "./MessageGroup.module.css";
import { MessageGroupProps } from "@interfaces/interfaces";
import { APIMessage } from "@foxogram/api-types";

const MessageGroup = ({ messages, currentUserId }: MessageGroupProps) => {
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => { setIsAnimated(true); }, 100);
        return () => { clearTimeout(t); };
    }, []);

    if (messages.length === 0) return null;

    return (
        <div className={`${styles["message-group"]} ${!isAnimated ? styles["animated-group"] : ""}`}>
            {messages.map((msg: APIMessage, idx: number) => (
                <MessageItem
                    key={msg.id}
                    content={msg.content}
                    created_at={msg.created_at}
                    author={msg.author}
                    currentUserId={currentUserId}
                    attachments={msg.attachments ?? []}
                    status={msg.status}
                    onDelete={() => {}}
                    onEdit={() => {}}
                    onReply={() => {}}
                    onForward={() => {}}
                    showAuthorName={idx === 0}
                    showAvatar={idx === messages.length - 1}
                />
            ))}
        </div>
    );
};

export default MessageGroup;
