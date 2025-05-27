import { ChatAvatarProps } from "@interfaces/interfaces";
import { timestampToHSV } from "@utils/functions";
import { memo } from "preact/compat";
import styles from "./ChatItem.module.scss";

const ChatAvatar = ({ chat }: ChatAvatarProps) => {
	const ts = chat.created_at;
	const { h, s } = timestampToHSV(ts);
	const v = 70;
	const backgroundColor = `hsl(${h}, ${s}%, ${v}%)`;

	return chat.icon ? (
		<img
			src={`https://cdn.foxogram.su/attachments/${chat.icon.uuid}`}
			alt={chat.name}
			className={styles.chatAvatar}
		/>
	) : (
		<div className={styles.defaultAvatar} style={{ backgroundColor }}>
			{(chat.display_name || chat.name).charAt(0).toUpperCase()}
		</div>
	);
};

export default memo(ChatAvatar);
