import MessageItem from "@components/RightBar/MessageList/MessageGroup/MessageItem/MessageItem";
import { MessageGroupProps } from "@interfaces/interfaces";
import appStore from "@store/app";
import { APIMessage } from "foxochat.js";
import { memo } from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import * as styles from "./MessageGroup.module.scss";

const MessageGroup = ({
	messages,
	currentUserId,
	channelId,
}: MessageGroupProps) => {
	const [isAnimated, setIsAnimated] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => {
			setIsAnimated(true);
		}, 100);
		return () => {
			clearTimeout(t);
		};
	}, []);

	const handleDelete = (messageId: number) => {
		appStore.deleteMessage(messageId);
	};

	const handleEdit = (messageId: number, currentContent: string) => {
		const newContent = prompt("Enter new message for edit:", currentContent);
		if (newContent && newContent !== currentContent) {
			appStore.updateMessage(messageId, newContent);
		}
	};

	if (!messages || messages.length === 0) return null;

	return (
		<div
			className={`${styles.messageGroup} ${!isAnimated ? styles.animatedGroup : ""}`}
		>
			{messages.map((msg: APIMessage, idx: number) => (
				<MessageItem
					key={msg.id}
					content={msg.content}
					created_at={msg.created_at}
					author={msg.author}
					currentUserId={currentUserId}
					attachments={msg.attachments ?? []}
					status={(msg as any).status ?? "sent"}
					showAuthorName={idx === 0}
					showAvatar={idx === messages.length - 1}
					messageId={msg.id}
					channelId={channelId}
					onDelete={() => handleDelete(msg.id)}
					onEdit={() => handleEdit(msg.id, msg.content)}
					onReply={() => {}}
					onForward={() => {}}
					onRetry={() => {}}
				/>
			))}
		</div>
	);
};

export default memo(MessageGroup);
