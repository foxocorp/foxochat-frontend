import { Tooltip } from "@components/Chat/Tooltip/Tooltip";
import accountSwitchIcon from "@icons/navigation/account-switch.svg";
import settingsIcon from "@icons/navigation/settings.svg";
import { UserInfoProps } from "@interfaces/interfaces";
import { apiMethods } from "@services/API/apiMethods";
import { timestampToHSV } from "@utils/functions";
import { APIAttachment } from "foxochat.js";
import { autorun } from "mobx";
import { observer } from "mobx-react";
import { useEffect, useState } from "preact/hooks";
import * as styles from "./UserInfo.module.scss";

const statusTextMap: Record<string, string> = {
	online: "Online",
	waiting: "Waiting for network...",
};

const UserInfoComponent = ({ username, status }: UserInfoProps) => {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isAccountSwitchOpen, setIsAccountSwitchOpen] = useState(false);
	const [userData, setUserData] = useState<{
		username: string;
		avatar: APIAttachment | undefined;
		status: string;
		created_at: number;
	} | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
	const [connectionStatus, setConnectionStatus] = useState<
		"online" | "waiting"
	>("waiting");
	const [displayStatus, setDisplayStatus] = useState(connectionStatus);
	const [animating, setAnimating] = useState(false);

	useEffect(() => {
		if (connectionStatus === displayStatus) return;

		setAnimating(true);
		const timeout = setTimeout(() => {
			setDisplayStatus(connectionStatus);
			setAnimating(false);
		}, 600);

		return () => {
			clearTimeout(timeout);
		};
	}, [connectionStatus, displayStatus]);

	const fetchUser = async () => {
		try {
			const user = await apiMethods.getCurrentUser();
			setUserData({
				username: user.username,
				avatar: user.avatar,
				status: status ?? "Unknown",
				created_at: user.created_at,
			});

			const { h, s } = timestampToHSV(user.created_at);
			const avatarBg = `hsl(${h}, ${s}%, 50%)`;
			setBackgroundColor(avatarBg);
		} catch {
			setError("Failed to load user data.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchUser();
	}, []);

	useEffect(() => {
		function updateStatus() {
			if (!navigator.onLine) {
				setConnectionStatus("waiting");
			} else {
				setConnectionStatus("online");
			}
		}

		updateStatus();

		window.addEventListener("online", updateStatus);
		window.addEventListener("offline", updateStatus);

		const disposer = autorun(() => {
			updateStatus();
		});

		return () => {
			window.removeEventListener("online", updateStatus);
			window.removeEventListener("offline", updateStatus);
			disposer();
		};
	}, []);

	if (loading) {
		return (
			<div className={styles.userInfo}>
				<div className={`${styles.userAvatar} ${styles.skeleton}`} />
				<div className={styles.userDetails}>
					<div className={`${styles.username} ${styles.skeleton}`} />
					<div className={`${styles.status} ${styles.skeleton}`} />
				</div>
				<div className={styles.userActions}>
					<div className={`${styles.actionIcon} ${styles.skeleton}`} />
					<div className={`${styles.actionIcon} ${styles.skeleton}`} />
				</div>
			</div>
		);
	}

	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div className={styles.userInfo}>
			{userData?.avatar ? (
				<img
					src={userData.avatar.uuid}
					alt={`${userData.username} Avatar`}
					className={styles.userAvatar}
					style={{ backgroundColor }}
				/>
			) : (
				<div className={styles.defaultAvatar} style={{ backgroundColor }}>
					{(userData?.username ?? username).charAt(0).toUpperCase()}
				</div>
			)}

			<div className={styles.userDetails}>
				<p className={styles.username}>@{userData?.username ?? username}</p>
				<p className={styles.status}>
					<span
						className={`${styles.statusText} ${animating ? styles.exit : ""}`}
						key={displayStatus + "-old"}
						aria-hidden="true"
					>
						{statusTextMap[displayStatus]}
					</span>
					{animating && (
						<span
							className={`${styles.statusText} ${styles.enter}`}
							key={connectionStatus + "-new"}
						>
							{statusTextMap[connectionStatus]}
						</span>
					)}
				</p>
			</div>
			<div className={styles.userActions}>
				<Tooltip text="Temporarily unavailable">
					<img
						src={accountSwitchIcon}
						alt="Switch Account"
						className={styles.actionIcon}
						onClick={() => {
							setIsAccountSwitchOpen(!isAccountSwitchOpen);
						}}
					/>
				</Tooltip>

				<Tooltip text="Temporarily unavailable">
					<img
						src={settingsIcon}
						alt="Settings"
						className={styles.actionIcon}
						onClick={() => {
							setIsSettingsOpen(!isSettingsOpen);
						}}
					/>
				</Tooltip>
			</div>
		</div>
	);
};

export default observer(UserInfoComponent);
