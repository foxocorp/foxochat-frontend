import DefaultAvatar from "@/components/Base/DefaultAvatar/DefaultAvatar";
import { config } from "@/lib/config/endpoints";
import { MemberListProps } from "@interfaces/interfaces";
import { apiMethods } from "@services/API/apiMethods";
import appStore from "@store/app";
import { classNames } from "@utils/functions";
import { APIMember } from "foxochat.js";
import { observer } from "mobx-react";
import { useEffect, useState, useMemo } from "preact/compat";
import Loading from "../MessageList/MessageLoader/MessageLoader";
import * as styles from "./MemberList.module.scss";

const isOnline = (status: number | string): boolean => {
	return status === 1 || status === "Online" || status === "ONLINE";
};

const formatLastSeen = (timestamp: number, currentTime: number): string => {
	const diff = currentTime - timestamp;
	return diff < 60000 ? "just now" :
		diff < 3600000 ? `${Math.floor(diff / 60000)}m ago` :
		diff < 86400000 ? `${Math.floor(diff / 3600000)}h ago` :
		diff < 604800000 ? `${Math.floor(diff / 86400000)}d ago` :
		Math.floor(timestamp / 86400000) === Math.floor(currentTime / 86400000)
			? `today ${new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
			: new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const MemberListComponent = ({ channelId }: MemberListProps) => {
	const [members, setMembers] = useState<APIMember[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentTime, setCurrentTime] = useState(Date.now());

	useEffect(() => {
		const fetchMembers = async () => {
			try {
				setLoading(true);
				const membersList = await apiMethods.listChannelMembers(channelId);
				setMembers(membersList);
			} catch (err) {
				console.error("Failed to fetch channel members:", err);
				setError("Failed to load members");
			} finally {
				setLoading(false);
			}
		};

		void fetchMembers();
	}, [channelId]);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(Date.now());
		}, 30000);

		return () => clearInterval(interval);
	}, []);

	const sortedMembers = useMemo(() => {
		if (!members.length) return [];
		
		return [...members].sort((a, b) => {
			if (a.user.id === appStore.currentUserId) return -1;
			if (b.user.id === appStore.currentUserId) return 1;
			
			const aStatus = appStore.userStatuses.get(a.user.id) ?? a.user.status;
			const bStatus = appStore.userStatuses.get(b.user.id) ?? b.user.status;
			
			const aOnline = isOnline(aStatus);
			const bOnline = isOnline(bStatus);
			
			if (aOnline !== bOnline) return aOnline ? -1 : 1;
			
			return (a.user.display_name || a.user.username).localeCompare(
				b.user.display_name || b.user.username
			);
		});
	}, [members, appStore.currentUserId, appStore.userStatuses]);

	if (loading) {
		return (
			<div className={styles.memberList}>
				<Loading />
			</div>
		);
	}

	if (error) {
		return (
			<div className={styles.memberList}>
				<div className={styles.error}>{error}</div>
			</div>
		);
	}

	return (
		<div className={styles.memberList}>
			<h3 className={styles.title}>Members</h3>
			<div className={styles.members}>
				{sortedMembers.map((member) => {
					const isCurrentUser = member.user.id === appStore.currentUserId;
					const currentStatus = appStore.userStatuses.get(member.user.id) ?? member.user.status;
					const isUserOnline = isOnline(currentStatus);
					
					return (
						<div 
							key={member.user.id} 
							className={styles.member}
						>
							<div className={styles.avatar}>
								{member.user.avatar ? (
									<img
										src={`${config.cdnBaseUrl}${member.user.avatar.uuid}`}
										alt={member.user.username}
										className={styles.avatarImage}
									/>
								) : (
									<DefaultAvatar
										createdAt={member.user.created_at}
										displayName={member.user.username}
										size="medium"
									/>
								)}
								{isUserOnline && (
									<div className={classNames(styles.statusIndicator, styles.online)} />
								)}
							</div>
							<div className={styles.memberInfo}>
								<div className={styles.displayName}>
									{member.user.display_name || member.user.username}
									{isCurrentUser && <span className={styles.youLabel}> (you)</span>}
								</div>
								<div className={classNames(styles.status, isUserOnline ? styles.online : styles.offline)}>
									{isUserOnline ? "online" : `last seen ${formatLastSeen(member.user.status_updated_at || 0, currentTime)}`}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default observer(MemberListComponent);
