import DefaultAvatar from "@/components/Base/DefaultAvatar/DefaultAvatar";
import { Tooltip } from "@/components/Chat/Tooltip/Tooltip";
import { apiMethods } from "@services/API/apiMethods";
import { APIChannel } from "foxochat.js";
import { memo } from "preact/compat";
import { useCallback, useEffect, useState } from "preact/hooks";
import * as styles from "./ChatOverview.module.scss";
import MemberList from "./MemberList";

import EditIcon from "@/assets/icons/right-bar/chat/chat-overview/edit.svg";
import MuteIcon from "@/assets/icons/right-bar/chat/chat-overview/mute.svg";
import PinIcon from "@/assets/icons/right-bar/chat/chat-overview/pin.svg";
import TrashIcon from "@/assets/icons/right-bar/chat/chat-overview/trash.svg";

interface ChatOverviewProps {
	channel: APIChannel;
	isOwner: boolean;
}

const ChatOverview = ({ channel, isOwner }: ChatOverviewProps) => {
	const handleEditChannel = useCallback(() => {
		// TODO: Implement edit channel
	}, []);

	const handlePinChannel = useCallback(() => {
		// TODO: Implement pin channel
	}, []);

	const handleMuteChannel = useCallback(() => {
		// TODO: Implement mute channel
	}, []);

	const handleDeleteChannel = useCallback(() => {
		if (isOwner) {
			void apiMethods.deleteChannel(channel.id);
		} else {
			void apiMethods.leaveChannel(channel.id);
		}
	}, [channel.id, isOwner]);

	const [onlineCount, setOnlineCount] = useState<number>(0);

	useEffect(() => {
		const fetchOnlineCount = async () => {
			try {
				const members = await apiMethods.listChannelMembers(channel.id);
				const online = members.filter((m) => m.user.status === 1).length;
				setOnlineCount(online);
			} catch (err) {
				console.error("Failed to fetch channel members:", err);
			}
		};

		void fetchOnlineCount();
	}, [channel.id]);

	return (
		<div className={styles.overview}>
			<div className={styles.header}>
				<div className={styles.headerBackground}>
					{channel.icon ? (
						<img
							src={`${config.cdnBaseUrl}${channel.icon.uuid}`}
							alt={channel.name}
							className={styles.backgroundAvatar}
						/>
					) : (
						<DefaultAvatar
							createdAt={channel.created_at}
							displayName={channel.display_name || channel.name}
							size="fill"
							square
						/>
					)}
					<div className={styles.headerOverlay} />
					<div className={styles.headerContent}>
						<h2 className={styles.channelName}>
							{channel.display_name || channel.name}
						</h2>
						<div className={styles.memberCount}>
							{channel.member_count} Members • {onlineCount} Online
						</div>
						<div className={styles.actions}>
							{isOwner && (
								<Tooltip text="Edit" position="top">
									<button
										className={styles.actionButton}
										onClick={handleEditChannel}
									>
										<img src={EditIcon} alt="Edit" />
									</button>
								</Tooltip>
							)}
							<Tooltip text="Mute" position="top">
								<button
									className={styles.actionButton}
									onClick={handleMuteChannel}
								>
									<img src={MuteIcon} alt="Mute" />
								</button>
							</Tooltip>
							<Tooltip text="Pin" position="top">
								<button
									className={styles.actionButton}
									onClick={handlePinChannel}
								>
									<img src={PinIcon} alt="Pin" />
								</button>
							</Tooltip>
							<Tooltip text={isOwner ? "Leave" : "Delete"} position="top">
								<button
									className={`${styles.actionButton} ${styles.dangerButton}`}
									onClick={handleDeleteChannel}
								>
									<img src={TrashIcon} alt={isOwner ? "Leave" : "Delete"} />
								</button>
							</Tooltip>
						</div>
					</div>
				</div>
			</div>
			<MemberList channelId={channel.id} />
		</div>
	);
};

export default memo(ChatOverview);
