import MessageItem from "@components/RightBar/MessageList/MessageGroup/MessageItem/MessageItem";
import { MessageGroupProps } from "@interfaces/interfaces";
import { apiMethods } from "@services/API/apiMethods";
import { Logger } from "@utils/logger";
import { APIMessage } from "foxogram.js";
import { memo } from "preact/compat";
import { useEffect, useMemo, useState } from "preact/hooks";
import * as styles from "./MessageGroup.module.scss";

const MessageGroup = ({
	messages,
	currentUserId,
	channelId,
}: MessageGroupProps) => {
	const [isAnimated, setIsAnimated] = useState(false);
	const [messageList, setMessageList] = useState<APIMessage[]>(messages);

	useEffect(() => {
		const t = setTimeout(() => {
			setIsAnimated(true);
		}, 100);
		return () => {
			clearTimeout(t);
		};
	}, []);

	useEffect(() => {
		setMessageList(messages);
	}, [messages]);

	const memoizedMessages = useMemo(() => {
		if (!Array.isArray(messageList)) {
			Logger.warn(`Messages is not an array: ${messageList}`);
			return [];
		}
		return messageList.filter((msg) => msg?.id && msg?.author?.user?.id);
	}, [messageList]);

	const handleDelete = async (messageId: number) => {
		try {
			await apiMethods.deleteMessage(channelId, messageId);
			setMessageList((prev) => prev.filter((msg) => msg.id !== messageId));
		} catch (error) {
			console.error(error);
		}
	};

	const handleEdit = (messageId: number, currentContent: string) => {
		const newContent = prompt("Enter new message for edit:", currentContent);
		if (newContent && newContent !== currentContent) {
			apiMethods
				.editMessage(channelId, messageId, { content: newContent })
				.then((updatedMessage) => {
					setMessageList((prev) =>
						prev.map((msg) =>
							msg.id === messageId
								? { ...msg, content: updatedMessage.content }
								: msg,
						),
					);
				})
				.catch((error: unknown) => {
					console.error(error);
				});
		}
	};

	if (memoizedMessages.length === 0) return null;

	return (
		<div
			className={`${styles.messageGroup} ${!isAnimated ? styles.animatedGroup : ""}`}
		>
			{memoizedMessages.map((msg: APIMessage, idx: number) => (
				<MessageItem
					key={msg.id}
					content={msg.content}
					created_at={msg.created_at}
					author={msg.author}
					currentUserId={currentUserId}
					attachments={msg.attachments ?? []}
					status={msg.status ?? "sent"}
					showAuthorName={idx === 0}
					showAvatar={idx === memoizedMessages.length - 1}
					messageId={msg.id}
					channelId={channelId}
					onDelete={() => handleDelete(msg.id)}
					onEdit={() => handleEdit(msg.id, msg.content)}
				/>
			))}
		</div>
	);
};

export default memo(MessageGroup);
