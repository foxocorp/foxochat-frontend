import accountSwitchIcon from "@/assets/icons/left-bar/navigation/user/account-switch.svg";
import settingsIcon from "@/assets/icons/left-bar/navigation/user/settings.svg";
import DefaultAvatar from "@components/Base/DefaultAvatar/DefaultAvatar";
import { Tooltip } from "@components/Chat/Tooltip/Tooltip";
import { UserInfoProps } from "@interfaces/interfaces";
import { autorun } from "mobx";
import { observer } from "mobx-react";
import { useEffect, useState } from "preact/hooks";
import * as styles from "./UserInfo.module.scss";

const statusTextMap: Record<string, string> = {
	online: "Online",
	waiting: "Waiting for network...",
};

const UserInfoComponent = ({ user }: UserInfoProps) => {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isAccountSwitchOpen, setIsAccountSwitchOpen] = useState(false);
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

	return (
		<div className={styles.userInfo}>
			{user?.avatar?.uuid ? (
				<img
					src={`${config.cdnBaseUrl}${user.avatar.uuid}`}
					alt={`${user.username} Avatar`}
					className={styles.userAvatar}
				/>
			) : (
				<DefaultAvatar
					createdAt={user?.created_at ?? 0}
					displayName={user.username}
					size="medium"
				/>
			)}

			<div className={styles.userDetails}>
				<p className={styles.username}>@{user.username}</p>
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
