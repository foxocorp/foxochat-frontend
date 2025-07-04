import { MessageListProps } from "@interfaces/interfaces";
import appStore from "@store/app";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { useEffect, useMemo } from "preact/hooks";
import EmptyChat from "./EmptyChat/EmptyChat";
import MessageGroup from "./MessageGroup/MessageGroup";
import * as styles from "./MessageList.module.scss";
import MessageLoader from "./MessageLoader/MessageLoader";

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
	const isLoading = appStore.isInitialLoad.get(channelId) || false;
	const unreadCount = appStore.unreadCount.get(channelId) || 0;

	useEffect(() => {
		if (!messages && !appStore.activeRequests.has(String(channelId))) {
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
				<MessageLoader isVisible={true} />
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

	const groupedMessages = useMemo(() => {
		const groupsByDate: Record<string, typeof messages> = {};

		for (const msg of messages) {
			const dateKey = getDateKey(msg.created_at);
			if (!groupsByDate[dateKey]) groupsByDate[dateKey] = observable.array([]);
			groupsByDate[dateKey].push(msg);
		}

		return Object.entries(groupsByDate)
			.sort(([a], [b]) => dayjs(b).unix() - dayjs(a).unix())
			.map(([dateKey, msgs]) => {
				const authorGroups: { msgs: typeof msgs }[] = [];
				if (msgs.length === 0) {
					return { date: "", groups: [] };
				}
				let buffer = observable.array<(typeof msgs)[0]>([]);
				let lastAuthor = msgs[0]?.author.user.id;
				let lastTimestamp = msgs[0]?.created_at ?? Date.now();

				for (const msg of msgs) {
					const sameAuthor = msg.author.user.id === lastAuthor;
					const withinTimeout =
						Math.abs(msg.created_at - (lastTimestamp ?? Date.now())) <= 300_000;

					if (sameAuthor && withinTimeout) {
						buffer.push(msg);
					} else {
						if (buffer.length) authorGroups.push({ msgs: buffer });
						buffer = observable.array([msg]);
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
	}, [messages?.length, channelId]);

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
							key={`group-${date}-${msgs[0]?.id ?? idx}`}
						>
							<MessageGroup
								messages={msgs.slice()}
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
