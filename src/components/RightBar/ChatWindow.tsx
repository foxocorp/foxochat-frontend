import type { ChatWindowProps } from "@interfaces/interfaces";
import appStore from "@store/app";
import { Logger } from "@utils/logger";
import type { APIChannel } from "foxochat.js";
import { reaction } from "mobx";
import { observer } from "mobx-react";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import DragAndDropIcon from "@/assets/icons/right-bar/chat/drag-and-drop.svg";
import ChatHeader from "./ChatHeader/ChatHeader";
import ChatOverview from "./ChatOverview/ChatOverview";
import * as styles from "./ChatWindow.module.scss";
import MessageInput from "./MessageInput/MessageInput";
import MessageList from "./MessageList/MessageList";

const ChatWindowComponent = ({
	channel,
	isMobile,
	onBack,
}: ChatWindowProps) => {
	const listRef = useRef<HTMLDivElement>(null);
	const [showScrollButton, setShowScrollButton] = useState(false);
	const [isFirstLoad, setIsFirstLoad] = useState(true);
	const [isDragOver, setIsDragOver] = useState(false);
	const isFetchingOlderMessages = useRef(false);
	const lastScrollTop = useRef(0);
	const anchorMessageId = useRef<number | null>(null);
	const anchorOffset = useRef<number>(0);
	const scrollTimeout = useRef<number | null>(null);
	const isMounted = useRef(true);
	const [showOverview, setShowOverview] = useState(true);

	const apiChannel = channel as unknown as APIChannel;
	const isOwner = apiChannel.owner?.id === appStore.currentUserId;

	const addFilesToQueue = useCallback((files: File[]) => {
		const event = new CustomEvent("addFilesToQueue", { detail: { files } });
		window.dispatchEvent(event);
	}, []);

	const handleDragEnter = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer?.types.includes("Files")) {
			setIsDragOver(true);
		}
	}, []);

	const handleDragOver = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDragLeave = useCallback((e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.relatedTarget === null) {
			setIsDragOver(false);
		}
	}, []);

	const handleDrop = useCallback(
		(e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragOver(false);

			const files = Array.from(e.dataTransfer?.files || []);
			if (files.length > 0) {
				addFilesToQueue(files);
			}
		},
		[addFilesToQueue],
	);

	useEffect(() => {
		const container = listRef.current?.parentElement?.parentElement;
		if (!container) return;

		const handlers = [
			["dragenter", handleDragEnter],
			["dragover", handleDragOver],
			["dragleave", handleDragLeave],
			["drop", handleDrop],
		] as const;

		handlers.forEach(([event, handler]) => {
			container.addEventListener(event, handler);
		});

		return () => {
			handlers.forEach(([event, handler]) => {
				container.removeEventListener(event, handler);
			});
		};
	}, [handleDragEnter, handleDragOver, handleDragLeave, handleDrop]);

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

			scrollTimeout.current = Number(
				setTimeout(async () => {
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
				}, 100),
			);
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
		<div
			className={`${styles.chatWindowContainer} ${isDragOver ? styles.dragOver : ""}`}
			style={{ display: "flex", flexDirection: "column", height: "100%" }}
		>
			<div className={styles.chatWindow} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
				<div className={styles.messageListWrapper} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
					<ChatHeader
						chat={apiChannel}
						avatar={`${config.cdnBaseUrl}${channel.icon?.uuid}`}
						username={channel.name}
						displayName={channel.display_name}
						channelId={channel.id}
						isMobile={isMobile}
						onBack={isMobile ? onBack : undefined}
						showOverview={showOverview}
						setShowOverview={setShowOverview}
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
				</div>
				<MessageInput
					onSendMessage={(c, f) => appStore.sendMessage(c, f)}
					isSending={appStore.isSendingMessage}
				/>
			</div>
			{showScrollButton && (
				<button
					className={`${styles.scrollButton} ${styles.visible}`}
					onClick={handleScrollToBottom}
					title="New messages"
					style={{ right: showOverview ? "340px" : "20px" }}
				>
					↓ {appStore.unreadCount.get(channel.id) || ""}
				</button>
			)}
			{isDragOver && (
				<div className={styles.dragOverlay}>
					<div className={styles.dragBox}>
						<img
							src={DragAndDropIcon}
							alt="Add files"
							className={styles.dragIcon}
						/>
						<p className={styles.dragTextTitle}>Add files</p>
						<p className={styles.dragTextSub}>100MB size limit</p>
						<p className={styles.dragTextInfo}>
							You can add text before uploading files
						</p>
					</div>
				</div>
			)}
			<ChatOverview
				channel={apiChannel}
				isOwner={isOwner}
				visible={showOverview}
			/>
		</div>
	);
};

export default observer(ChatWindowComponent);
