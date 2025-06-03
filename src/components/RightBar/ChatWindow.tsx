import { ChatWindowProps } from "@interfaces/interfaces";
import appStore from "@store/app";
import { Logger } from "@utils/logger";
import { autorun } from "mobx";
import { observer } from "mobx-react";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import ChatHeader from "./ChatHeader/ChatHeader";
import * as styles from "./ChatWindow.module.scss";
import MessageInput from "./MessageInput/MessageInput";
import MessageList from "./MessageList/MessageList";

const ChatWindowComponent = ({
	channel,
	isMobile,
	onBack,
}: ChatWindowProps) => {
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

		const handleHashChange = () => {
			if (isProgrammaticHashChange.current) return;

			const hash = window.location.hash.substring(1);
			if (!hash) {
				if (lastValidChannelId.current !== null) {
					appStore.setCurrentChannel(null).catch(console.error);
				}
				return;
			}

			const channelId = parseInt(hash, 10);
			if (isNaN(channelId)) {
				restoreLastValidChannel();
				return;
			}

			if (channelId === lastValidChannelId.current) return;

			const channelExists = appStore.channels.some((c) => c.id === channelId);
			if (!channelExists) {
				restoreLastValidChannel();
				return;
			}

			appStore
				.setCurrentChannel(channelId)
				.then(() => {
					lastValidChannelId.current = channelId;
				})
				.catch(() => {
					restoreLastValidChannel();
				});
		};

		window.addEventListener("hashchange", handleHashChange);
		return () => {
			window.removeEventListener("hashchange", handleHashChange);
		};
	}, []);

	useEffect(() => {
		(async () => {
			Logger.debug(`Initializing channel: ${channel.id}`);
			await appStore.initChannel(channel.id);
			const messages = appStore.messagesByChannelId.get(channel.id);
			Logger.debug(`Messages after initChannel: ${messages}`);
			if (!messages || messages.length === 0) {
				Logger.warn(`No messages loaded for channel: ${channel.id}`);
			}
		})().catch((error: unknown) => {
			Logger.error(`Error in initChannel: ${error}`);
		});
	}, [channel.id]);

	useEffect(() => {
		return () => {
			if (listRef.current) {
				appStore.channelScrollPositions.set(
					channel.id,
					listRef.current.scrollTop,
				);
			}
			const messages = appStore.messagesByChannelId.get(channel.id);
			if (messages && messages.length > 0) {
				appStore.lastViewedMessageTimestamps.set(
					channel.id,
					messages[messages.length - 1].created_at,
				);
			}
		};
	}, [channel.id]);

	useLayoutEffect(() => {
		const messages = appStore.messagesByChannelId.get(channel.id);
		if (messages && messages.length > 0 && listRef.current) {
			const savedScrollPosition =
				appStore.channelScrollPositions.get(channel.id) ||
				listRef.current.scrollHeight;
			listRef.current.scrollTo({ top: savedScrollPosition, behavior: "auto" });
			lastScrollAtBottom.current =
				savedScrollPosition === listRef.current.scrollHeight;
			setShowScrollButton(!lastScrollAtBottom.current);
		}
	}, [channel.id, appStore.messagesByChannelId.get(channel.id)?.length]);

	useEffect(() => {
		const stop = autorun(() => {
			const messages = appStore.messagesByChannelId.get(channel.id);
			if (!messages) return;

			if (
				messages.length > prevMessageCount.current &&
				lastScrollAtBottom.current
			) {
				requestAnimationFrame(() => {
					if (listRef.current) {
						listRef.current.scrollTo({
							top: listRef.current.scrollHeight,
							behavior: "smooth",
						});
						setShowScrollButton(false);
					}
				});
			}

			prevMessageCount.current = messages.length;
		});

		return () => stop();
	}, [channel.id, lastScrollAtBottom.current]);

	const handleScroll = async (e: Event) => {
		const el = e.currentTarget as HTMLDivElement;
		const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
		lastScrollAtBottom.current = nearBottom;
		setShowScrollButton(!nearBottom);

		const messages = appStore.messagesByChannelId.get(channel.id);
		if (!messages?.length || appStore.activeRequests.has(channel.id)) return;
		if (el.scrollTop > 100) return;

		const hasMore = appStore.hasMoreMessagesByChannelId.get(channel.id);
		if (!hasMore) return;

		const prevHeight = el.scrollHeight;

		await appStore.fetchMessages(channel.id, {
			before: messages[0].created_at,
		});

		if (listRef.current) {
			const newHeight = listRef.current.scrollHeight;
			listRef.current.scrollTop = newHeight - prevHeight + el.scrollTop;
		}
	};

	const handleScrollToBottom = () => {
		if (listRef.current) {
			listRef.current.scrollTo({
				top: listRef.current.scrollHeight,
				behavior: "smooth",
			});
			lastScrollAtBottom.current = true;
			setShowScrollButton(false);
		}
	};

	return (
		<div className={styles.chatWindow}>
			<ChatHeader
				chat={channel}
				avatar={`https://cdn.foxogram.su/attachments/${channel.icon?.uuid}`}
				username={channel.name}
				displayName={channel.display_name}
				channelId={channel.id}
				isMobile={isMobile}
				onBack={isMobile ? onBack : undefined}
			/>
			<MessageList
				messages={appStore.messagesByChannelId.get(channel.id) ?? []}
				isLoading={appStore.loadingInitial.has(channel.id)}
				isInitialLoading={appStore.loadingInitial.has(channel.id)}
				currentUserId={appStore.currentUserId ?? -1}
				messageListRef={listRef}
				onScroll={handleScroll}
				channel={channel}
			/>
			{showScrollButton && (
				<button
					className={`${styles.scrollButton} ${styles.visible}`}
					onClick={handleScrollToBottom}
					title="Scroll to bottom"
					type="button"
				>
					↓
				</button>
			)}
			<MessageInput
				onSendMessage={(c, f) => appStore.sendMessage(c, f)}
				isSending={appStore.isSendingMessage}
			/>
		</div>
	);
};

export default observer(ChatWindowComponent);
