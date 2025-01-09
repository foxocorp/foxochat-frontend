import styles from "./MessageItem.module.css";
import { Message} from "../../../../../types/chatTypes.ts";

const MessageItem = ({ content, timestamp, isSender }: Message) => {
    return (
        <div className={`${styles["message-item"]} ${isSender ? styles["sender"] : styles["receiver"]}`}>
            <div className={styles["message-content"]}>
                <p>{content}</p>
                <span className={styles["message-time"]}>{timestamp}</span>
            </div>
        </div>
    );
};

export default MessageItem;
