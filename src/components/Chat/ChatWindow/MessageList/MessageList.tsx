import MessageItem from "./MessageItem/MessageItem";
import styles from "./MessageList.module.css";
import { MessageListProps } from "@interfaces/chat.interface.ts";
import { useEffect } from "preact/hooks";

const MessageList = ({ messages, currentUserId, onScroll, messageListRef }: MessageListProps) => {
    let lastAuthorId: number | null = null;

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className={styles["message-list"]} ref={messageListRef} onScroll={onScroll}>
            {messages.map((msg) => {
                const isFirstMessageFromUser = lastAuthorId !== msg.author.id;
                lastAuthorId = msg.author.id;

                return (
                    <MessageItem
                        key={msg.id}
                        content={msg.content}
                        created_at={msg.created_at}
                        author={msg.author}
                        currentUserId={currentUserId}
                        showAuthorName={isFirstMessageFromUser}
                    />
                );
            })}
        </div>
    );
};

export default MessageList;
