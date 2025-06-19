import DefaultAvatar from "@/components/Base/DefaultAvatar/DefaultAvatar";
import { config } from "@/lib/config/endpoints";
import { MemberListProps } from "@interfaces/interfaces";
import { apiMethods } from "@services/API/apiMethods";
import { classNames } from "@utils/functions";
import { APIMember } from "foxochat.js";
import { memo, useEffect, useState } from "preact/compat";
import Loading from "../MessageList/MessageLoader/MessageLoader";
import * as styles from "./MemberList.module.scss";

const isOnline = (status: number | string): boolean => {
	return status === 1 || status === "Online" || status === "ONLINE";
};

const MemberList = ({ channelId }: MemberListProps) => {
	const [members, setMembers] = useState<APIMember[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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
				{members.map((member) => (
					<div key={member.user.id} className={styles.member}>
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
						</div>
						<div className={styles.memberInfo}>
							<div className={styles.displayName}>
								{member.user.display_name || member.user.username}
							</div>
							<div
								className={classNames(
									styles.status,
									isOnline(member.user.status) ? styles.online : styles.offline,
								)}
							>
								{isOnline(member.user.status) ? "online" : "offline"}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default memo(MemberList);
