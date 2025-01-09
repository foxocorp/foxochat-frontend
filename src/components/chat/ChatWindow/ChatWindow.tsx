import { useState } from "preact/hooks";
import MessageList from "./MessageList/MessageList";
import MessageInput from "./MessageInput/MessageInput";
import ChatHeader from "../ChatHeader/ChatHeader";
import styles from "./ChatWindow.module.css";
import { Message, Chat } from "../../../types/chatTypes";

interface ChatWindowProps {
    chat: Chat;
}

const ChatWindow = ({ chat }: ChatWindowProps) => {
    const [messages, setMessages] = useState<Message[]>([
        { content: "Hi, how are you?", timestamp: "10:30 AM", isSender: false },
        { content: "I'm good, thanks! How about you?", timestamp: "10:32 AM", isSender: true },
    ]);

    const handleSendMessage = (newMessage: string) => {
        const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setMessages([
            ...messages,
            { content: newMessage, timestamp: currentTime, isSender: true },
        ]);
    };

    const handleSendMedia = () => {};

    return (
        <div className={styles["chat-window"]}>
            <ChatHeader
                avatar={chat.avatar}
                username={chat.displayName}
                status="Online"
            />
            <MessageList messages={messages} />
            <MessageInput onSendMessage={handleSendMessage} onSendMedia={handleSendMedia} />
        </div>
    );
};

export default ChatWindow;
