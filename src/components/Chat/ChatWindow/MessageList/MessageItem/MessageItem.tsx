import styles from "./MessageItem.module.css";
import { APIUser, APIMember } from "@foxogram/api-types";
import moment from "moment";

interface MessageItemProps {
    content: string;
    created_at: number;
    author: APIUser | APIMember;
    currentUserId: number;
    showAuthorName: boolean;
}

const isAuthor = (author: APIUser | APIMember, currentUserId: number): boolean => {
    const userId = "user" in author ? author.user.id : author.id;
    return userId === currentUserId;
};

const getAuthorName = (author: APIUser | APIMember): string | undefined => {
    if ("user" in author) {
        return author.user.display_name || author.user.username;
    }
    return author.display_name || author.username;
};

const formatMessageTime = (timestamp: number): string => {
    return moment(timestamp).format("HH:mm");
};

const MessageItem = ({
                         content,
                         created_at,
                         author,
                         currentUserId,
                         showAuthorName,
                     }: MessageItemProps) => {
    const isMessageAuthor = isAuthor(author, currentUserId);
    const formattedTime = formatMessageTime(created_at);
    const authorName = getAuthorName(author);

    return (
        <div
            className={`${styles["message-item"]} ${
                isMessageAuthor ? styles["author"] : styles["receiver"]
            }`}>
            <div className={styles["message-container"]}>
                <div className={styles["message-content"]}>
                    {!isMessageAuthor && showAuthorName && (
                        <span className={styles["author-name"]}>{authorName}</span>
                    )}
                    <div className={styles["message-text-container"]}>
                        <div className={styles["message"]}>{content}</div>
                        <span className={styles["message-time"]}>{formattedTime}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageItem;