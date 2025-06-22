import { memo } from 'preact/compat';
import * as styles from './DefaultAvatar.module.scss';
import { classNames, timestampToHSV } from '@utils/functions';

interface DefaultAvatarProps {
	createdAt: number;
	displayName?: string;
	size?: 'small' | 'medium' | 'large' | 'fill';
	square?: boolean;
}

const DefaultAvatar = ({ createdAt, displayName = '', size = 'medium', square = false }: DefaultAvatarProps) => {
	const initial = displayName.charAt(0).toUpperCase();
	const { h, s } = timestampToHSV(createdAt);
	const background = `hsl(${h}, ${s}%, 50%)`;

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
