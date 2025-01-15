import styles from "./MessageItem.module.css";
import { Author } from "@types/chatTypes.ts";

const MessageItem = ({ content, created_at, author }: { content: string, created_at: number, author: Author }) => {
    return (
        <div className={`${styles["message-item"]} ${author.id === author.user.id ? styles["author"] : styles["receiver"]}`}>
            <div className={styles["message-content"]}>
                <p>{content}</p>
                <span className={styles["message-time"]}>{created_at}</span>
            </div>
        </div>
    );
};

export default MessageItem;
