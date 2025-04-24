import { useRef, useEffect } from "preact/hooks";
import { observer } from "mobx-react";
import MessageList from "./MessageList/MessageList";
import MessageInput from "./MessageInput/MessageInput";
import ChatHeader from "./ChatHeader/ChatHeader";
import styles from "./ChatWindow.module.css";
import chatStore from "@store/chat/index";
import { ChatWindowProps } from "@interfaces/interfaces";
import { useThrottle } from "@hooks/useThrottle";

interface Props extends ChatWindowProps {
    isMobile: boolean;
    onBack?: () => void;
}

const ChatWindowComponent = ({ channel, isMobile, onBack }: Props) => {
    const messageListRef = useRef<HTMLDivElement>(null);
    const messages = chatStore.messagesByChannelId[channel.id] ?? [];
    const isProgrammaticHashChange = useRef(false);
    const lastValidChannelId = useRef<number | null>(null);
    const scrollState = useRef({ prevHeight: 0, lastLoadPosition: 0, isTracking: false });

    useEffect(() => {
        if (channel.id) {
            lastValidChannelId.current = channel.id;
            isProgrammaticHashChange.current = true;
            window.location.hash = `#${channel.id}`;
            setTimeout(() => {
                isProgrammaticHashChange.current = false;
            }, 100);
        }
    }, []);

    useEffect(() => {
        if (channel.id && channel.id !== lastValidChannelId.current) {
            lastValidChannelId.current = channel.id;
            isProgrammaticHashChange.current = true;
            window.location.hash = `#${channel.id}`;
            setTimeout(() => {
                isProgrammaticHashChange.current = false;
            }, 100);
        }
    }, [channel.id]);

    useEffect(() => {
        const handleHashChange = () => {
            if (isProgrammaticHashChange.current) return;

            const hash = window.location.hash.substring(1);

            if (!hash) {
                if (lastValidChannelId.current !== null) {
                    chatStore.setCurrentChannel(null).catch(console.error);
                }
                return;
            }

            const channelId = parseInt(hash, 10);

            if (isNaN(channelId)) {
                restoreLastValidChannel();
                return;
            }

            if (channelId === lastValidChannelId.current) return;

            const channelExists = chatStore.channels.some(c => c.id === channelId);
            if (!channelExists) {
                restoreLastValidChannel();
                return;
            }

            chatStore.setCurrentChannel(channelId)
                .then(() => {
                    lastValidChannelId.current = channelId;
                })
                .catch(() => {
                    restoreLastValidChannel();
                });
        };

        const restoreLastValidChannel = () => {
            isProgrammaticHashChange.current = true;
            if (lastValidChannelId.current !== null) {
                window.location.hash = `#${lastValidChannelId.current}`;
            } else {
                window.location.hash = "";
            }
            setTimeout(() => {
                isProgrammaticHashChange.current = false;
            }, 100);
        };

        window.addEventListener("hashchange", handleHashChange);
        return () => { window.removeEventListener("hashchange", handleHashChange); };
    }, []);

    useEffect(() => {
        const hash = window.location.hash.substring(1);
        if (hash && !isNaN(Number(hash))) {
            const channelId = Number(hash);
            if (channelId !== channel.id) {
                chatStore.setCurrentChannel(channelId).catch(console.error);
            }
        }
    }, []);

    useEffect(() => {
        const name = channel.display_name || channel.name || "";
        document.title = name ? `Foxogram: ${name}` : "Foxogram";
    }, [channel]);


    const handleScroll = useThrottle(() => {
        const list = messageListRef.current;
        if (!list || chatStore.isLoadingHistory || !messages.length) return;
        const scrollPosition = list.scrollTop;
        const triggerZone = list.clientHeight * 0.7;
        if (scrollPosition < triggerZone && !scrollState.current.isTracking) {
            scrollState.current.prevHeight = list.scrollHeight;
            scrollState.current.lastLoadPosition = scrollPosition;
            scrollState.current.isTracking = true;
            const beforeTimestamp = messages[0]?.created_at ?? undefined;
            void chatStore.fetchMessages(channel.id, beforeTimestamp).finally(() => {
                scrollState.current.isTracking = false;
            });
        }
    }, 300);

    return (
        <div className={styles["chat-window"]}>
            <ChatHeader
                avatar={channel.icon}
                username={channel.name}
                displayName={channel.display_name}
                channelId={channel.id}
                isMobile={isMobile}
                onBack={isMobile ? (onBack as () => void) : () => {}}
            />
            <MessageList
                messages={messages}
                currentUserId={chatStore.currentUserId ?? -1}
                messageListRef={messageListRef}
                onScroll={handleScroll}
                channel={channel}
            />
            <MessageInput
                onSendMessage={(content, files) => chatStore.sendMessage(content, files)}
                isSending={chatStore.isSendingMessage}
            />
        </div>
    );
};

const ChatWindow = observer(ChatWindowComponent);
export default ChatWindow;
