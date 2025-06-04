import EmptyChat from "@components/RightBar/MessageList/EmptyChat/EmptyChat";
import MessageGroup from "@components/RightBar/MessageList/MessageGroup/MessageGroup";
import MessageLoader from "@components/RightBar/MessageList/MessageLoader/MessageLoader";
import type { MessageListProps } from "@interfaces/interfaces";
import appStore from "@store/app";
import { Logger } from "@utils/logger";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { observer } from "mobx-react";
import { useEffect, useMemo } from "preact/hooks";
import * as styles from "./MessageList.module.scss";

dayjs.extend(localizedFormat);
dayjs.extend(isToday);

const MessageListComponent = ({
	messages: propMessages,
	isLoading: propIsLoading,
	isInitialLoading: propIsInitialLoading,
	currentUserId,
	messageListRef,
	onScroll,
	channel,
}: MessageListProps & { isLoading: boolean; channel: { id: number } }) => {
	const messages = useMemo(() => {
		const storeMessages = appStore.messagesByChannelId.get(channel.id);
		Logger.debug(
			"Messages from appStore:",
			storeMessages,
			"channelId:",
			channel.id,
		);
		return storeMessages ?? propMessages;
	}, [channel.id, propMessages]);

	const isLoading = propIsLoading || appStore.loadingInitial.has(channel.id);
	const isInitialLoading =
		propIsInitialLoading || appStore.loadingInitial.has(channel.id);

	Logger.debug(
		"MessageList render - messages:",
		messages,
		"isLoading:",
		isLoading,
		"isInitialLoading:",
		isInitialLoading,
		"channelId:",
		channel.id,
	);

	useEffect(() => {
		Logger.debug("MessageList useEffect - messages updated:", messages);
		if (!messages || messages.length === 0) {
			Logger.warn(`No messages loaded for channel: ${channel.id}`);
			if (!appStore.activeRequests.has(channel.id)) {
				Logger.debug(`Triggering initChannel for: ${channel.id}`);
				appStore
					.initChannel(channel.id)
					.catch((error) =>
						Logger.error(`Error in manual initChannel: ${error}`),
					);
			}
		}
	}, [messages, channel.id]);

	if (isLoading || isInitialLoading) {
		return (
			<div
				ref={messageListRef}
				onScroll={onScroll}
				className={styles.messageList}
			>
				<MessageLoader />
			</div>
		);
	}

	if (!messages || messages.length === 0) {
		return (
			<div
				ref={messageListRef}
				onScroll={onScroll}
				className={styles.messageList}
			>
				<EmptyChat />
			</div>
		);
	}

	const dayGroups = useMemo(() => {
		const groups: { date: string; msgs: typeof messages }[] = [];
		let currentDay = "";
		for (const msg of messages) {
			const d = dayjs(msg.created_at).format("YYYY-MM-DD");
			if (d !== currentDay) {
				groups.push({ date: d, msgs: [msg] });
				currentDay = d;
			} else {
				groups[groups.length - 1].msgs.push(msg);
			}
		}
		return groups;
	}, [messages]);

	const groups = useMemo(() => {
		return dayGroups.map(({ date, msgs }) => {
			const messageGroups: { msgs: typeof msgs }[] = [];
			if (!msgs.length) return { date, groups: messageGroups };

			let grp = msgs.slice(0, 1);
			let lastAuthor = msgs[0].author.user.id;
			for (let i = 1; i < msgs.length; i++) {
				const msg = msgs[i];
				const prev = msgs[i - 1];
				const timeoutSplit = msg.created_at - prev.created_at > 300_000;
				if (msg.author.user.id !== lastAuthor || timeoutSplit) {
					messageGroups.push({ msgs: grp });
					grp = [msg];
					lastAuthor = msg.author.user.id;
				} else {
					grp.push(msg);
				}
			}
			messageGroups.push({ msgs: grp });
			return { date, groups: messageGroups };
		});
	}, [dayGroups]);

	return (
		<div
			ref={messageListRef}
			onScroll={onScroll}
			className={styles.messageList}
		>
			{groups.map(({ date, groups }) => (
				<div key={date}>
					<div className={styles.stickyDate}>
						{dayjs(date).isToday()
							? "Today"
							: dayjs(date).format("D MMMM YYYY")}
					</div>
					{groups.map((g, idx) => (
						<MessageGroup
							key={`${date}-${g.msgs[0]?.id ?? idx}-${idx}`}
							messages={g.msgs}
							currentUserId={currentUserId}
							channelId={channel.id}
						/>
					))}
				</div>
			))}
		</div>
	);
};

export default observer(MessageListComponent);
