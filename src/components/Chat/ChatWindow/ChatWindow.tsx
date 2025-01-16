import { useState, useEffect } from "preact/hooks";
import MessageList from "./MessageList/MessageList";
import MessageInput from "./MessageInput/MessageInput";
import ChatHeader from "../ChatHeader/ChatHeader";
import styles from "./ChatWindow.module.css";
import { WebSocketClient } from "../../../gateway/webSocketClient.ts";
import { Message, Channel } from "@types/chatTypes.ts";

interface ChatWindowProps {
    channel: Channel;
    wsClient: WebSocketClient;
}

const ChatWindow = ({ channel, wsClient }: ChatWindowProps) => {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const handleMessageCreate = (newMessage: Message) => {
            setMessages((prevMessages) => {
                if (prevMessages.some(msg => msg.id === newMessage.id)) {
                    return prevMessages;
                }

                return [
                    ...prevMessages,
                    newMessage,
                ];
            });
        };

        wsClient.on("messageCreate", handleMessageCreate);

        return () => {
            wsClient.off("messageCreate", handleMessageCreate);
        };
    }, [wsClient]);

    const handleSendMessage = (newMessage: string) => {
        wsClient.sendMessage({ content: newMessage, attachments: [] });
    };

    return (
        <div className={styles["Chat-window"]}>
            <ChatHeader avatar={channel.icon} username={channel.display_name || channel.name} status="Онлайн" />
            <MessageList messages={messages} />
            <MessageInput onSendMessage={handleSendMessage} />
        </div>
    );
};

export default ChatWindow;