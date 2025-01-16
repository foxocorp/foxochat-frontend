import { useState, useEffect } from "preact/hooks";
import MessageList from "./MessageList/MessageList";
import MessageInput from "./MessageInput/MessageInput";
import ChatHeader from "../ChatHeader/ChatHeader";
import styles from "./ChatWindow.module.css";
import { ChatWindowProps, Message } from "@interfaces/chat.interface.ts";


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
        <div className={styles["chat-window"]}>
            <ChatHeader avatar={channel.icon} username={channel.display_name || channel.name} status="Онлайн" />
            <MessageList messages={messages} />
            <MessageInput onSendMessage={handleSendMessage} />
        </div>
    );
};

export default ChatWindow;