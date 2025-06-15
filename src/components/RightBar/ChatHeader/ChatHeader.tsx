import { ChatHeaderProps } from "@interfaces/interfaces";
import { apiMethods } from "@services/API/apiMethods";
import DefaultAvatar from "@/components/Base/DefaultAvatar/DefaultAvatar";
import { useEffect, useState } from "preact/hooks";
import * as style from "./ChatHeader.module.scss";
import appStore from "@store/app";
import { autorun } from "mobx";

const ChatHeader = ({ chat, isMobile, onBack }: ChatHeaderProps) => {
	const { id, name, display_name, icon, created_at } = chat;
	const nameToDisplay = display_name || name;
	const [participantsCount, setParticipantsCount] = useState<number>(0);

	useEffect(() => {
		const fetchMembers = async () => {
			if (appStore.channelParticipantsCount.has(id)) {
				setParticipantsCount(appStore.channelParticipantsCount.get(id) ?? 0);
				return;
			}

			try {
				const members = await apiMethods.listChannelMembers(id);
				const count = members.length || 0;
				appStore.channelParticipantsCount.set(id, count);
				setParticipantsCount(count);
			} catch (error) {
				console.error("Failed to fetch members:", error);
			}
		};

		if (id) {
			void fetchMembers();
		}

		const disposer = autorun(() => {
			const count = appStore.channelParticipantsCount.get(id) ?? 0;
			setParticipantsCount(count);
		});

		return () => {
			disposer();
		};
	}, [id]);

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
					<span>• {participantsCount} Members</span>
				</div>
			</div>
		</div>
	);
};

export default ChatHeader;
