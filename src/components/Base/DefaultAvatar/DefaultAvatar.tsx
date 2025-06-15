import { timestampToHSV } from "@utils/functions";
import * as styles from "./DefaultAvatar.module.scss";

interface DefaultAvatarProps {
	createdAt: number;
	displayName?: string | null;
	size?: 'small' | 'medium' | 'large';
}

const DefaultAvatar = ({ createdAt, displayName = "U", size = 'medium' }: DefaultAvatarProps) => {
	const { h, s } = timestampToHSV(createdAt);
	const backgroundColor = `hsl(${h}, ${s}%, 50%)`;
	const firstLetter = (displayName || "U").charAt(0).toUpperCase();

	return (
		<div className={`${styles.defaultAvatar} ${styles[size]}`} style={{ backgroundColor }}>
			{firstLetter}
		</div>
	);
};

export default DefaultAvatar; 