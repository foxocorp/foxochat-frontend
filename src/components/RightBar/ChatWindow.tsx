import { ChatWindowProps } from "@interfaces/interfaces";
import appStore from "@store/app";
import { Logger } from "@utils/logger";
import { reaction } from "mobx";
import { observer } from "mobx-react";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import ChatHeader from "./ChatHeader/ChatHeader";
import * as styles from "./ChatWindow.module.scss";
import MessageInput from "./MessageInput/MessageInput";
import MessageList from "./MessageList/MessageList";
import ChatOverview from "./ChatOverview/ChatOverview";
import type { APIChannel } from "foxochat.js";

const ChatWindowComponent = ({
	channel,
	isMobile,
	onBack,
}: ChatWindowProps) => {
	const listRef = useRef<HTMLDivElement>(null);
	const [showScrollButton, setShowScrollButton] = useState(false);
	const [isFirstLoad, setIsFirstLoad] = useState(true);
	const isFetchingOlderMessages = useRef(false);
	const lastScrollTop = useRef(0);
	const anchorMessageId = useRef<number | null>(null);
	const anchorOffset = useRef<number>(0);
	const scrollTimeout = useRef<number | null>(null);
	const isMounted = useRef(true);
	const isProgrammaticHashChange = useRef(false);
	const lastValidChannelId = useRef<number | null>(null);

	const apiChannel = channel as unknown as APIChannel;
	const isOwner = apiChannel.owner?.id === appStore.currentUserId;

	useEffect(() => {
		const handleHashChange = async () => {
			if (isProgrammaticHashChange.current) return;

			const hash = window.location.hash.substring(1);
			if (!hash) {
				if (lastValidChannelId.current !== null) {
					await appStore.setCurrentChannel(null);
				}
				return;
			}

			const channelId = parseInt(hash, 10);
			if (isNaN(channelId)) {
				window.location.hash = "";
				return;
			}

			if (channelId === lastValidChannelId.current) return;

			try {
				const channelExists = appStore.channels.some((c) => c.id === channelId);
				if (!channelExists) {
					window.location.hash = "";
					await appStore.setCurrentChannel(null);
					return;
				}

				await appStore.setCurrentChannel(channelId);
				lastValidChannelId.current = channelId;
			} catch (error) {
				Logger.error(`Error handling hash change: ${error}`);
				window.location.hash = "";
				await appStore.setCurrentChannel(null);
			}
		};

		handleHashChange().catch(console.error);

		window.addEventListener("hashchange", handleHashChange);
		return () => {
			window.removeEventListener("hashchange", handleHashChange);
		};
	}, []);

	useEffect(() => {
		if (channel.id) {
			if (channel.id === lastValidChannelId.current) return;

			lastValidChannelId.current = channel.id;
			isProgrammaticHashChange.current = true;
			window.location.hash = `#${channel.id}`;
			setTimeout(() => {
				isProgrammaticHashChange.current = false;
			}, 100);
		}
	}, [channel.id]);

	useEffect(() => {
		(async () => {
			if (!channel.id) return;
			try {
				await appStore.initChannel(channel.id);
				if (isMounted.current) {
					setIsFirstLoad(false);
				}
			} catch (error) {
				Logger.error(`Error in initChannel: ${error}`);
			}
		})();
		return () => {
			if (scrollTimeout.current !== null) {
				clearTimeout(scrollTimeout.current);
				scrollTimeout.current = null;
			}
		};
	}, [channel.id]);

	/*
	useEffect(() => {
		return () => {
			if (listRef.current && appStore.currentChannelId === channel.id) {
				const scrollPosition =
					listRef.current.scrollHeight -
					listRef.current.clientHeight -
					listRef.current.scrollTop;
				appStore.channelScrollPositions.set(channel.id, scrollPosition);
			}
			if (scrollTimeout.current !== null) {
				clearTimeout(scrollTimeout.current);
				scrollTimeout.current = null;
			}
		};
	}, [channel.id]);
	*/

	const messages = (appStore.messagesByChannelId.get(channel.id) ?? [])
		.slice()
		.sort((a, b) => a.created_at - b.created_at);

	const isLoading =
		appStore.isLoadingHistory ||
		appStore.isInitialLoad.get(channel.id) ||
		false;

	useEffect(() => {
		const disposer = reaction(
			() => appStore.messagesByChannelId.get(channel.id)?.length ?? 0,
			(length, prevLength) => {
				if (!listRef.current || isLoading || !isMounted.current) return;

				requestAnimationFrame(() => {
					if (!listRef.current || !isMounted.current) return;

					try {
						if (isFirstLoad) {
							listRef.current.scrollTop = listRef.current.scrollHeight;
							appStore.setIsCurrentChannelScrolledToBottom(true);
							setIsFirstLoad(false);
						} else if (appStore.isCurrentChannelScrolledToBottom) {
							listRef.current.scrollTop = listRef.current.scrollHeight;
						} else if (
							length > prevLength &&
							!isFetchingOlderMessages.current
						) {
							/*
							const scrollPosition =
								appStore.channelScrollPositions.get(channel.id) || 0;
							listRef.current.scrollTop =
								listRef.current.scrollHeight -
								listRef.current.clientHeight -
								scrollPosition;
							*/
						} else if (length > prevLength && isFetchingOlderMessages.current) {
							if (anchorMessageId.current !== null) {
								const anchorElement = document.getElementById(
									`messageGroup-${anchorMessageId.current}`,
								);
								if (anchorElement) {
									const rect = anchorElement.getBoundingClientRect();
									const containerRect = listRef.current.getBoundingClientRect();
									const newScrollTop =
										listRef.current.scrollTop +
										(rect.top - containerRect.top - anchorOffset.current);
									listRef.current.scrollTop = newScrollTop;
									Logger.info(
										`Restored scroll to message ${anchorMessageId.current}: scrollTop=${newScrollTop}, offset=${anchorOffset.current}`,
									);
								}
							}
						}
					} catch (error) {
						Logger.error(`Error in reaction scroll adjustment: ${error}`);
					}
				});
			},
			{ equals: (a, b) => a === b },
		);

		return () => {
			disposer();
			if (scrollTimeout.current !== null) {
				clearTimeout(scrollTimeout.current);
				scrollTimeout.current = null;
			}
			Logger.debug(`Reaction and timeout cleaned up for channel ${channel.id}`);
		};
	}, [channel.id, isLoading, isFirstLoad]);

	const handleScroll = useCallback(
		async (_e: Event) => {
			if (scrollTimeout.current !== null) {
				clearTimeout(scrollTimeout.current);
			}

			scrollTimeout.current = Number(setTimeout(async () => {
				if (!listRef.current || !isMounted.current) return;

				const el = listRef.current;
				if (!el) return;

				const scrollTop = el.scrollTop;
				const scrollHeight = el.scrollHeight;
				const clientHeight = el.clientHeight;

				const threshold = clientHeight * 0.3;
				const atBottom = scrollTop + clientHeight >= scrollHeight - threshold;
				if (isMounted.current) {
					appStore.setIsCurrentChannelScrolledToBottom(atBottom);
					setShowScrollButton(!atBottom && messages.length > 50);
				}

				const nearTop = scrollTop <= clientHeight * 4;
				const isScrollingUp = scrollTop < lastScrollTop.current;

				if (
					nearTop &&
					isScrollingUp &&
					!isLoading &&
					!isFetchingOlderMessages.current &&
					appStore.hasMoreMessagesByChannelId.get(channel.id)
				) {
					isFetchingOlderMessages.current = true;

					const visibleMessages = messages
						.map((msg) => ({
							msg,
							element: document.getElementById(`messageGroup-${msg.id}`),
						}))
						.filter(({ element }) => element !== null);
					const topMessage = visibleMessages.find(({ element }) => {
						if (!listRef.current || !element) return false;
						const rect = element.getBoundingClientRect();
						const containerRect = listRef.current.getBoundingClientRect();
						return (
							rect.top >= containerRect.top &&
							rect.top <= containerRect.top + clientHeight * 0.5
						);
					});

					if (topMessage && listRef.current) {
						anchorMessageId.current = topMessage.msg.id;
						const rect = topMessage.element?.getBoundingClientRect();
						if (!rect) return;
						const containerRect = listRef.current.getBoundingClientRect();
						anchorOffset.current = rect.top - containerRect.top;
						Logger.info(
							`Anchored to message ${anchorMessageId.current} at offset ${anchorOffset.current}`,
						);
					} else {
						anchorMessageId.current = null;
						anchorOffset.current = 0;
						Logger.debug(`No anchor message found`);
					}

					const oldestMessage = messages[0];
					const oldestMessageTime = oldestMessage
						? oldestMessage.created_at
						: Date.now();

					try {
						await appStore.fetchOlderMessages(channel.id, oldestMessageTime);
					} catch (error) {
						Logger.error(`Failed to fetch older messages: ${error}`);
					} finally {
						if (isMounted.current) {
							isFetchingOlderMessages.current = false;
						}
					}
				}

				lastScrollTop.current = scrollTop;
			}, 100));
		},
		[channel.id, messages, isLoading],
	);
	useEffect(() => {
		const el = listRef.current;
		if (el) {
			el.addEventListener("scroll", handleScroll);
		}
		return () => {
			if (el) {
				el.removeEventListener("scroll", handleScroll);
			}
			if (scrollTimeout.current !== null) {
				clearTimeout(scrollTimeout.current);
				scrollTimeout.current = null;
			}
		};
	}, [handleScroll, channel.id]);

	const handleScrollToBottom = () => {
		if (listRef.current && isMounted.current) {
			listRef.current.scrollTo({ top: 0, behavior: "smooth" });
			appStore.setIsCurrentChannelScrolledToBottom(true);
			setShowScrollButton(false);
			anchorMessageId.current = null;
		}
	};

	return (
		<div className={styles.chatWindowContainer}>
			<div className={styles.chatWindow}>
				<ChatHeader
					chat={apiChannel}
					avatar={`${config.cdnBaseUrl}${channel.icon?.uuid}`}
					username={channel.name}
					displayName={channel.display_name}
					channelId={channel.id}
					isMobile={isMobile}
					onBack={isMobile ? onBack : undefined}
				/>
				<MessageList
					messages={messages}
					isLoading={isLoading}
					isInitialLoading={appStore.isInitialLoad.get(channel.id) || false}
					currentUserId={appStore.currentUserId ?? -1}
					messageListRef={listRef}
					onScroll={handleScroll}
					channel={apiChannel}
				/>
				{showScrollButton && (
					<button
						className={`${styles.scrollButton} ${styles.visible}`}
						onClick={handleScrollToBottom}
						title="New messages"
					>
						↓ {appStore.unreadCount.get(channel.id) || ""}
					</button>
				)}
				<MessageInput
					onSendMessage={(c, f) => appStore.sendMessage(c, f)}
					isSending={appStore.isSendingMessage}
				/>
			</div>
			<ChatOverview channel={apiChannel} isOwner={isOwner} />
		</div>
	);
};

export default observer(ChatWindowComponent);
