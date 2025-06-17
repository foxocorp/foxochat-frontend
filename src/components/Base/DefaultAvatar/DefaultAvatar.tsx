import { memo } from 'preact/compat';
import * as styles from './DefaultAvatar.module.scss';
import { classNames } from '@utils/functions';

interface DefaultAvatarProps {
	createdAt: number;
	displayName?: string;
	size?: 'small' | 'medium' | 'large' | 'fill';
	square?: boolean;
}

const DefaultAvatar = ({ createdAt, displayName = '', size = 'medium', square = false }: DefaultAvatarProps) => {
	const initial = displayName.charAt(0).toUpperCase();
	const hue = (createdAt % 360) + 1;
	const background = `hsl(${hue}, 40%, 40%)`;

	return (
		<div 
			className={classNames(
				styles.defaultAvatar,
				styles[size],
				square && styles.square
			)}
			style={{ background }}
		>
			{initial}
		</div>
	);
};

export default memo(DefaultAvatar);
