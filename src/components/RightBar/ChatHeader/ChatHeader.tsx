import { ChatHeaderProps } from "@interfaces/interfaces";
import { apiMethods } from "@services/API/apiMethods";
import { timestampToHSV } from "@utils/functions";
import { useEffect, useState } from "preact/hooks";
import style from "./ChatHeader.module.scss";

const ChatHeader = ({ chat, isMobile, onBack }: ChatHeaderProps) => {
	const { id, name, display_name, icon, created_at } = chat;
	const nameToDisplay = display_name || name;
	const [participantsCount, setParticipantsCount] = useState<number | null>(
		null,
	);

	useEffect(() => {
		const fetchMembers = async () => {
			try {
				const members = await apiMethods.listChannelMembers(id);
				console.log(id);
				setParticipantsCount(members.length || 0);
			} catch (error) {
				console.error("Failed to fetch members:", error);
			}
		};

		if (id && participantsCount === null) {
			void fetchMembers();
		}
	}, [id, participantsCount]);

	const { h, s } = timestampToHSV(created_at);
	const v = 70;
	const backgroundColor = `hsl(${h}, ${s}%, ${v}%)`;

	return (
		<div className={style.chatHeader}>
			{isMobile && onBack && (
				<button className={style.backButton} onClick={onBack}>
					←
				</button>
			)}
			{icon ? (
				<img
					src={`https://cdn.foxogram.su/attachments/${icon.uuid}`}
					alt={`${nameToDisplay}'s avatar`}
					className={style.chatHeaderAvatar}
				/>
			) : (
				<div className={style.defaultAvatar} style={{ backgroundColor }}>
					{nameToDisplay.charAt(0).toUpperCase()}
				</div>
			)}
			<div className={style.chatHeaderInfo}>
				<p className={style.chatHeaderUsername}>{nameToDisplay}</p>
				<div className={style.chatHeaderMembers}>
					<span>• {participantsCount ?? "0"} Members</span>
				</div>
			</div>
		</div>
	);
};

export default ChatHeader;
