import { useEffect, useRef, useState, useLayoutEffect } from "preact/hooks";
import { observer } from "mobx-react";
import MessageList from "./MessageList/MessageList";
import MessageInput from "./MessageInput/MessageInput";
import ChatHeader from "./ChatHeader/ChatHeader";
import styles from "./ChatWindow.module.css";
import chatStore from "@store/chat/index";
import { ChatWindowProps } from "@interfaces/interfaces";
import { autorun } from "mobx";
import { Logger } from "@utils/logger";

const ChatWindowComponent = ({ channel, isMobile, onBack }: ChatWindowProps) => {
    const listRef = useRef<HTMLDivElement>(null);
    const lastScrollAtBottom = useRef(true);
    const prevMessageCount = useRef(0);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const isProgrammaticHashChange = useRef(false);
    const lastValidChannelId = useRef<number | null>(null);

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
        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    useEffect(() => {
        (async () => {
            await chatStore.initChannel(channel.id);
        })().catch((error: unknown) => { Logger.error(error); });
    }, [channel.id]);

    useEffect(() => {
        return () => {
            if (listRef.current) {
                chatStore.channelScrollPositions.set(channel.id, listRef.current.scrollTop);
            }
            const messages = chatStore.messagesByChannelId.get(channel.id);
            if (messages && messages.length > 0) {
                chatStore.lastViewedMessageTimestamps.set(channel.id, messages[messages.length - 1].created_at);
            }
        };
    }, [channel.id]);

    useLayoutEffect(() => {
        const messages = chatStore.messagesByChannelId.get(channel.id);
        if (messages && messages.length > 0 && listRef.current) {
            listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "auto" });
            lastScrollAtBottom.current = true;
            setShowScrollButton(false);
        }
    }, [channel.id, chatStore.messagesByChannelId.get(channel.id)]);

    useEffect(() => {
        const stop = autorun(() => {
            const messages = chatStore.messagesByChannelId.get(channel.id);
            if (!messages) return;

            if (messages.length > prevMessageCount.current && lastScrollAtBottom.current) {
                requestAnimationFrame(() => {
                    if (listRef.current) {
                        listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
                        setShowScrollButton(false);
                    }
                });
            }

            prevMessageCount.current = messages.length;
        });

        return () => { stop(); };
    }, [channel.id]);

    const handleScroll = async (e: Event) => {
        const el = e.currentTarget as HTMLDivElement;
        const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
        lastScrollAtBottom.current = nearBottom;
        setShowScrollButton(!nearBottom);

        const messages = chatStore.messagesByChannelId.get(channel.id);
        if (!messages?.length || chatStore.activeRequests.has(channel.id)) return;
        if (el.scrollTop > 100) return;

        const hasMore = chatStore.hasMoreMessagesByChannelId.get(channel.id);
        if (!hasMore) return;

        const prevHeight = el.scrollHeight;

        await chatStore.fetchMessages(channel.id, {
            before: messages[0].created_at,
        });

        if (listRef.current) {
            const newHeight = listRef.current.scrollHeight;
            listRef.current.scrollTop = newHeight - prevHeight + el.scrollTop;
        }
    };

    const handleScrollToBottom = () => {
        if (listRef.current) {
            listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
            lastScrollAtBottom.current = true;
            setShowScrollButton(false);
        }
    };

    return (
        <div className={styles["chat-window"]}>
            <ChatHeader
                avatar={channel.icon}
                username={channel.name}
                displayName={channel.display_name}
                channelId={channel.id}
                isMobile={isMobile}
                onBack={isMobile ? onBack : undefined}
            />
            <MessageList
                messages={chatStore.messagesByChannelId.get(channel.id) ?? []}
                isLoading={chatStore.loadingInitial.has(channel.id)}
                isInitialLoading={chatStore.loadingInitial.has(channel.id)}
                currentUserId={chatStore.currentUserId ?? -1}
                messageListRef={listRef}
                onScroll={handleScroll}
                channel={channel}
            />
            {showScrollButton && (
                <button
                    className={`${styles["scroll-button"]} ${showScrollButton ? styles.visible : ""}`}
                    onClick={handleScrollToBottom}
                    title="Scroll to bottom"
                >
                    ↓
                </button>
            )}
            <MessageInput
                onSendMessage={(c, f) => chatStore.sendMessage(c, f)}
                isSending={chatStore.isSendingMessage}
            />
        </div>
    );
};

export default observer(ChatWindowComponent);