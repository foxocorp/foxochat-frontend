import { ChatHeaderProps } from "@interfaces/interfaces";
import { apiMethods } from "@services/API/apiMethods";
import DefaultAvatar from "@/components/Base/DefaultAvatar/DefaultAvatar";
import { useEffect, useState } from "preact/hooks";
import * as style from "./ChatHeader.module.scss";

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
				setParticipantsCount(members.length || 0);
			} catch (error) {
				console.error("Failed to fetch members:", error);
			}
		};

		if (id && participantsCount === null) {
			void fetchMembers();
		}
	}, [id, participantsCount]);

	return (
		<div className={style.chatHeader}>
			{isMobile && onBack && (
				<button className={style.backButton} onClick={onBack}>
					←
				</button>
			)}
			{icon ? (
				<img
					src={`${config.cdnBaseUrl}${icon.uuid}`}
					alt={`${nameToDisplay}'s avatar`}
					className={style.chatHeaderAvatar}
				/>
			) : (
				<DefaultAvatar
					createdAt={created_at}
					displayName={nameToDisplay}
					size="medium"
				/>
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
