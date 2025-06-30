import * as styles from "@components/RightBar/MessageList/MessageGroup/MessageItem/MessageItem.module.scss";
import { AvatarProps } from "@interfaces/interfaces";
import { memo } from "preact/compat";

const Avatar = ({
	author,
	showAvatar,
	avatarBg,
	avatarInitial,
}: AvatarProps) => {
	if (!showAvatar) {
		return <div className={styles.avatarPlaceholder} />;
	}

	return (
		<div className={`${styles.avatarContainer}`}>
			{author?.user?.avatar?.uuid ? (
				<img
					src={`${config.cdnBaseUrl}${author.user.avatar.uuid}`}
					className={styles.avatar}
					alt={`${author?.user?.username ?? "User"} Avatar`}
				/>
			) : (
				<div
					className={styles.defaultAvatar}
					style={{ background: avatarBg }}
				>
					{avatarInitial}
				</div>
			)}
		</div>
	);
};

export default memo(Avatar);
