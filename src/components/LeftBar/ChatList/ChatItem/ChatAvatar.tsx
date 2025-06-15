import { memo } from "preact/compat";
import { ChatAvatarProps } from "@/interfaces/interfaces";
import { config } from "@/lib/config/endpoints";
import DefaultAvatar from "@/components/Base/DefaultAvatar/DefaultAvatar";
import * as styles from "./ChatItem.module.scss";

export const ChatAvatar = memo(({ chat }: ChatAvatarProps) => {
	const { icon, display_name, name, created_at } = chat;
	const displayName = display_name || name || "Unknown";

	return (
		<div className={styles.chatAvatar}>
			{icon ? (
				<img
					src={`${config.cdnBaseUrl}${typeof icon === 'string' ? icon : icon.uuid}`}
					alt={displayName}
					className={styles.chatAvatar}
				/>
			) : (
				<DefaultAvatar
					createdAt={created_at ?? Date.now()}
					displayName={displayName}
					size="medium"
				/>
			)}
		</div>
	);
});
