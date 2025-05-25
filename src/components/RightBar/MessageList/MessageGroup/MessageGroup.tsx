import { useState, useEffect, useMemo, useCallback } from "preact/hooks";
import MessageItem from "@components/RightBar/MessageList/MessageGroup/MessageItem/MessageItem";
import styles from "./MessageGroup.module.scss";
import { MessageGroupProps } from "@interfaces/interfaces";
import { APIMessage } from "@foxogram/api-types";
import { Logger } from "@utils/logger";
import { memo } from "preact/compat";


const MessageGroup = ({ messages, currentUserId }: MessageGroupProps) => {
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => {
            setIsAnimated(true);
        }, 100);
        return () => {
            clearTimeout(t);
        };
    }, []);

    const memoizedMessages = useMemo(() => {
        if (!Array.isArray(messages)) {
            Logger.warn("Messages is not an array:", messages);
            return [];
        }
        return messages.filter((msg) => msg?.id && msg?.author?.user?.id);
    }, [messages]);

    const onDelete = useCallback(() => {
    }, []);

    const onEdit = useCallback(() => {
    }, []);

    const onReply = useCallback(() => {
    }, []);

    const onForward = useCallback(() => {
    }, []);

    if (memoizedMessages.length === 0) return null;

    return (
        <div className={`${styles.messageGroup} ${!isAnimated ? styles.animatedGroup : ""}`}>
            {memoizedMessages.map((msg: APIMessage, idx: number) => (
                <MessageItem
                    key={msg.id}
                    content={msg.content}
                    created_at={msg.created_at}
                    author={msg.author}
                    currentUserId={currentUserId}
                    attachments={msg.attachments ?? []}
                    status={msg.status ?? "sent"}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onReply={onReply}
                    onForward={onForward}
                    showAuthorName={idx === 0}
                    showAvatar={idx === memoizedMessages.length - 1}
                />
            ))}
        </div>
    );
};

export default memo(MessageGroup);