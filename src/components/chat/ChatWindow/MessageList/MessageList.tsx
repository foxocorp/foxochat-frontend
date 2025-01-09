import MessageItem from "./MessageItem/MessageItem";
import styles from "./MessageList.module.css";
import { Message} from "../../../../types/chatTypes.ts";

interface MessageListProps {
    messages: Message[];
}

const MessageList = ({ messages }: MessageListProps) => {
    return (
        <div className={styles["message-list"]}>
            {messages.map((msg, index) => (
                <MessageItem
                    key={index}
                    content={msg.content}
                    timestamp={msg.timestamp}
                    isSender={msg.isSender}
                />
            ))}
        </div>
    );
};

export default MessageList;
