import * as styles from "@components/RightBar/MessageList/MessageGroup/MessageItem/MessageItem.module.scss";
import { MessageContentProps } from "@interfaces/interfaces";
import { memo } from "preact/compat";

const MessageContent = ({
	content,
	htmlContent,
	isMessageAuthor,
	showAuthorName,
	authorName,
	formattedTime,
	statusIcon,
	renderContent,
}: MessageContentProps) => {
	if (!content) return null;

	return (
		<>
			{showAuthorName && !isMessageAuthor && (
				<div className={styles.authorName}>{authorName}</div>
			)}
			<div className={styles.textContent}>
				{isMessageAuthor ? (
					<>
						<div className={styles.messageText}>
							{renderContent(htmlContent)}
						</div>
						<div className={styles.messageFooter}>
							<img
								src={statusIcon}
								className={styles.statusIcon}
								alt="Status"
							/>
							<span className={styles.timestamp}>{formattedTime}</span>
						</div>
					</>
				) : (
					<div className={styles.receiverMessageRow}>
						<div className={styles.messageText}>
							{renderContent(htmlContent)}
						</div>
						<span className={styles.timestamp}>{formattedTime}</span>
					</div>
				)}
			</div>
		</>
	);
};

export default memo(MessageContent);
