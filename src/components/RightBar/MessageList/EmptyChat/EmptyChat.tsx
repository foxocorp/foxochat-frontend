import DefaultAvatar from "@components/Base/DefaultAvatar/DefaultAvatar";
import type { EmptyChatProps } from "@interfaces/interfaces";
import { renderEmojisToJSX } from "@utils/emoji";
import { ChannelType } from "foxochat.js";
import { config } from "@/lib/config/endpoints";
import * as styles from "./EmptyChat.module.scss";

const EmptyChat = ({ channel }: EmptyChatProps) => {
	if (channel?.type === ChannelType.DM) {
		const displayName = channel.display_name || channel.name;
		const username = channel.username || channel.name;
		const isOnline = channel.status === 1;

		const lastUsernameChange = new Date(
			Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
		);
		const registrationDate = new Date(channel.created_at);

		const formatDate = (date: Date) => {
			return date.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			});
		};

		const formatTimeAgo = (date: Date) => {
			const now = new Date();
			const diffInHours = Math.floor(
				(now.getTime() - date.getTime()) / (1000 * 60 * 60),
			);

			if (diffInHours < 1) return "less than an hour ago";
			if (diffInHours === 1) return "1 hour ago";
			if (diffInHours < 24) return `${diffInHours} hours ago`;

			const diffInDays = Math.floor(diffInHours / 24);
			if (diffInDays === 1) return "1 day ago";
			if (diffInDays < 7) return `${diffInDays} days ago`;

			return formatDate(date);
		};

		return (
			<div className={styles.emptyChat}>
				<div className={styles.contactCard}>
					<div className={styles.avatarContainer}>
						{channel.avatar ? (
							<img
								src={`${config.cdnBaseUrl}${channel.avatar.uuid}`}
								alt={displayName}
								className={styles.avatar}
							/>
						) : (
							<DefaultAvatar
								createdAt={channel.created_at}
								username={username}
								size="large"
							/>
						)}
					</div>
					<div className={styles.contactInfo}>
						<h2 className={styles.contactName}>{displayName}</h2>
						<div
							className={`${styles.status} ${isOnline ? styles.online : styles.offline}`}
						>
							{isOnline ? "Online" : "Offline"}
						</div>
						<div className={styles.details}>
							<div className={styles.detailItem}>
								<span className={styles.detailLabel}>Registration date:</span>
								<span className={styles.detailValue}>
									{formatDate(registrationDate)}
								</span>
							</div>
							<div className={styles.detailItem}>
								<span className={styles.detailLabel}>Username changed:</span>
								<span className={styles.detailValue}>
									{formatTimeAgo(lastUsernameChange)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.emptyChat}>
			<div className={styles.emptyChatContainer}>
				<h2 className={styles.title}>It's kind of empty here...</h2>
				<p className={styles.description}>
					Would you like to fix it? Start the conversation first!
				</p>
			</div>
			<span className={styles.icon}>{renderEmojisToJSX("🤔", false, 100)}</span>
		</div>
	);
};

export default EmptyChat;
