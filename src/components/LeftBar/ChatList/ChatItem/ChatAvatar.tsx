import { memo } from "preact/compat";
import DefaultAvatar from "@/components/Base/DefaultAvatar/DefaultAvatar";
import type { ChatAvatarProps } from "@/interfaces/interfaces";
import { config } from "@/lib/config/endpoints";
import * as styles from "./ChatItem.module.scss";
import { TypeOrStatusBadge } from "./TypeOrStatusBadge";

interface ExtendedChatAvatarProps extends ChatAvatarProps {
	isOnline?: boolean | undefined;
	currentUserId?: number | null;
}

export const ChatAvatar = memo(
	({ chat, isOnline }: ExtendedChatAvatarProps) => {
		const { icon, display_name, name, created_at, type } = chat;
		const displayName = display_name || name || "Unknown";

		return (
			<div className={styles.chatAvatarWrapper}>
				<div className={styles.chatAvatar}>
					{icon && true && "uuid" in icon ? (
						<img
							src={`${config.cdnBaseUrl}${icon.uuid}`}
							alt={displayName}
							className={styles.chatAvatar}
						/>
					) : (
						<DefaultAvatar
							createdAt={created_at}
							username={displayName}
							size="medium"
						/>
					)}
				</div>
				<TypeOrStatusBadge type={type} isOnline={!!isOnline} />
			</div>
		);
	},
);
