import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { observer } from "mobx-react";
import { useEffect, useMemo } from "preact/hooks";

import EmptyChat from "@components/RightBar/MessageList/EmptyChat/EmptyChat";
import MessageGroup from "@components/RightBar/MessageList/MessageGroup/MessageGroup";
import MessageLoader from "@components/RightBar/MessageList/MessageLoader/MessageLoader";
import appStore from "@store/app";

import type { MessageListProps } from "@interfaces/interfaces";
import * as styles from "./MessageList.module.scss";

dayjs.extend(localizedFormat);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

const DATE_LABELS = {
	today: "Today",
	yesterday: "Yesterday",
};

const getDateKey = (timestamp: number) => dayjs(timestamp).format("YYYY-MM-DD");

const getDateLabel = (key: string) => {
	const date = dayjs(key);
	if (date.isToday()) return DATE_LABELS.today;
	if (date.isYesterday()) return DATE_LABELS.yesterday;
	return date.format("D MMMM YYYY");
};

const MessageListComponent = ({
	currentUserId,
	messageListRef,
	onScroll,
	channel,
}: MessageListProps & { channel: { id: number } }) => {
	const { id: channelId } = channel;
	const messages = appStore.messagesByChannelId.get(channelId);
	const isLoading = appStore.isInitialLoad.get(channelId) || !messages;
	const unreadCount = appStore.unreadCount.get(channelId) || 0;

	useEffect(() => {
		if (!messages && !appStore.activeRequests.has(channelId)) {
			appStore.initChannel(channelId).catch(console.error);
		}
	}, [channelId]);

	if (isLoading) {
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

	if (!messages?.length) {
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

	const groupedMessages = useMemo(() => {
		const groupsByDate: Record<string, typeof messages> = {};

		for (const msg of messages) {
			const dateKey = getDateKey(msg.created_at);
			if (!groupsByDate[dateKey]) groupsByDate[dateKey] = [];
			groupsByDate[dateKey].push(msg);
		}

		return Object.entries(groupsByDate)
			.sort(([a], [b]) => dayjs(b).unix() - dayjs(a).unix())
			.map(([dateKey, msgs]) => {
				const authorGroups: { msgs: typeof msgs }[] = [];
				let buffer: typeof msgs = [];
				let lastAuthor = msgs[0].author.user.id;
				let lastTimestamp = msgs[0].created_at;

				for (const msg of msgs) {
					const sameAuthor = msg.author.user.id === lastAuthor;
					const withinTimeout =
						Math.abs(msg.created_at - lastTimestamp) <= 300_000;

					if (sameAuthor && withinTimeout) {
						buffer.push(msg);
					} else {
						if (buffer.length) authorGroups.push({ msgs: buffer });
						buffer = [msg];
						lastAuthor = msg.author.user.id;
					}
					lastTimestamp = msg.created_at;
				}
				if (buffer.length) authorGroups.push({ msgs: buffer });

				return {
					date: getDateLabel(dateKey),
					groups: authorGroups,
				};
			});
	}, [messages]);

	return (
		<div
			ref={messageListRef}
			onScroll={onScroll}
			className={styles.messageList}
		>
			{groupedMessages.map(({ date, groups }) => (
				<div key={`date-${date}`}>
					<div className={styles.stickyDate}>{date}</div>
					{groups.map(({ msgs }, idx) => (
						<div
							id={`messageGroup-${msgs[0]?.id ?? idx}`}
							key={`group-${msgs[0]?.id ?? idx}`}
						>
							<MessageGroup
								messages={msgs}
								currentUserId={currentUserId}
								channelId={channelId}
							/>
						</div>
					))}
				</div>
			))}
			{unreadCount > 0 && (
				<div className={styles.unreadMarker}>New messages ({unreadCount})</div>
			)}
		</div>
	);
};

export default observer(MessageListComponent);
