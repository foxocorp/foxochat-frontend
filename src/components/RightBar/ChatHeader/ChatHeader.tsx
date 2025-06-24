import { Tooltip } from "@components/Chat/Tooltip/Tooltip";
import type { ChatHeaderProps } from "@interfaces/interfaces";
import { apiMethods } from "@services/API/apiMethods";
import appStore from "@store/app";
import { autorun } from "mobx";
import { useEffect, useState } from "preact/hooks";
import OverviewIcon from "@/assets/icons/right-bar/chat/chatHeader/chat-overview.svg";
import SearchIcon from "@/assets/icons/right-bar/chat/chatHeader/search.svg";
import DefaultAvatar from "@/components/Base/DefaultAvatar/DefaultAvatar";
import * as style from "./ChatHeader.module.scss";

const ChatHeader = ({
	chat,
	isMobile,
	onBack,
	showOverview,
	setShowOverview,
}: ChatHeaderProps) => {
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
			<div className={style.headerActions}>
				<button
					onClick={() => setShowOverview(!showOverview)}
					aria-label={showOverview ? "Hide chat info" : "Show chat info"}
					style={{
						background: "none",
						border: "none",
						padding: 8,
						borderRadius: 8,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<img src={OverviewIcon} alt="chat overview" />
				</button>
				<Tooltip text="Temporary unavailable" position="bottom">
					<button
						disabled
						style={{
							opacity: 0.5,
							cursor: "not-allowed",
							background: "none",
							border: "none",
							padding: 8,
							borderRadius: 8,
						}}
					>
						<img src={SearchIcon} alt="search" />
					</button>
				</Tooltip>
			</div>
		</div>
	);
};

export default ChatHeader;
