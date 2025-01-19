import { useEffect, useState, useRef } from "preact/hooks";
import MessageList from "./MessageList/MessageList";
import MessageInput from "./MessageInput/MessageInput";
import ChatHeader from "../ChatHeader/ChatHeader";
import styles from "./ChatWindow.module.css";
import { apiMethods } from "@services/api/apiMethods.ts";
import { ChatWindowProps, Message } from "@interfaces/chat.interface.ts";
import { APIMessage, APIUser } from "@foxogram/api-types";
import { Logger } from "../../../utils/logger.ts";

const ChatWindow = ({ channel, wsClient }: ChatWindowProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

    const messageListRef = useRef<HTMLDivElement | null>(null);

    const transformToMessage = ({ id, content, channel, attachments, created_at, author }: APIMessage): Message => {
        const authorData: APIUser = author.user;
        return {
            id,
            content,
            author: authorData,
            channel,
            attachments,
            created_at,
        };
    };

    const fetchCurrentUser = async () => {
        try {
            const { id } = await apiMethods.getCurrentUser();
            setCurrentUserId(id);
        } catch (error) {
            Logger.error((error instanceof Error ? error.message : "An unknown error occurred"));
        }
    };

    const fetchMessages = async () => {
        try {
            const messagesData = await apiMethods.listMessages(channel.id, { limit: 100 });
            setMessages(messagesData.map(({ id, content, channel, attachments, created_at, author }) => ({
                id,
                content,
                author: author.user,
                channel,
                attachments,
                created_at,
            })));
        } catch (error) {
            Logger.error((error instanceof Error ? error.message : "An unknown error occurred"));
        }
    };

    useEffect(() => {
        void fetchCurrentUser();
        void fetchMessages();

        const messageHandler = (newMessage: APIMessage) => {
            if (newMessage.channel.id === channel.id) {
                setMessages(prevMessages => [...prevMessages, transformToMessage(newMessage)]);
            }
        };

        wsClient.on("MESSAGE_CREATE", messageHandler);

        return () => {
            wsClient.off("MESSAGE_CREATE", messageHandler);
        };
    }, [channel.id, wsClient]);

    useEffect(() => {
        const handleScroll = () => {
            if (messageListRef.current) {
                const { scrollHeight, scrollTop, clientHeight } = messageListRef.current;
                const isAtBottom = scrollHeight - scrollTop <= clientHeight + 1;
                const showButton = scrollTop < scrollHeight - clientHeight - 20;
                setShowScrollButton(showButton && !isAtBottom);
            }
        };

        const scrollElement = messageListRef.current;
        if (scrollElement) {
            scrollElement.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (scrollElement) {
                scrollElement.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    const scrollToBottom = () => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    };

    if (currentUserId === null) return <div>Loading...</div>;

    return (
        <div className={styles["chat-window"]}>
            <ChatHeader avatar={channel.icon} username={channel.display_name || channel.name} status="Online" />
            <MessageList
                messages={messages}
                currentUserId={currentUserId}
                messageListRef={messageListRef}
                onScroll={(event) => {
                    const scrollElement = event.target as HTMLDivElement;
                    const { scrollHeight, scrollTop, clientHeight } = scrollElement;
                    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 1;
                    const showButton = scrollTop < scrollHeight - clientHeight - 20;
                    setShowScrollButton(showButton && !isAtBottom);
                }}
            />
            <MessageInput channelId={channel.id} />
            {showScrollButton && (
                <button className={styles["scroll-button"]} onClick={scrollToBottom}>
                    ↓
                </button>
            )}
        </div>
    );
};

export default ChatWindow;