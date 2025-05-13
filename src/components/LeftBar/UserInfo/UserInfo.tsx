import { useState, useEffect } from "preact/hooks";
import { apiMethods } from "@services/API/apiMethods";
import styles from "./UserInfo.module.scss";
import settingsIcon from "@icons/navigation/settings.svg";
import accountSwitchIcon from "@icons/navigation/account-switch.svg";
import { UserInfoProps } from "@interfaces/interfaces";
import chatStore from "@store/chat/index";

const UserInfo = ({ username, avatar, status }: UserInfoProps) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAccountSwitchOpen, setIsAccountSwitchOpen] = useState(false);
    const [userData, setUserData] = useState<{ username: string; avatar: string; status: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = async () => {
        try {
            const user = await apiMethods.getCurrentUser();
            setUserData({
                username: user.username,
                avatar: user.avatar,
                status: status ?? "Unknown",
            });
        } catch {
            setError("Failed to load user data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchUser();
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
            <img
                src={userData?.avatar ?? avatar}
                alt={`${userData?.username ?? username} Avatar`}
                className={styles.userAvatar}
            />
            <div className={styles.userDetails}>
                <p className={styles.username}>@{userData?.username ?? username}</p>
                <p className={styles.status}>{chatStore.wsClient?.isConnected ? "online" : "offline"}</p>
            </div>
            <div className={styles.userActions}>
                <img
                    src={accountSwitchIcon}
                    alt="Switch Account"
                    className={styles.actionIcon}
                    onClick={() => { setIsAccountSwitchOpen(!isAccountSwitchOpen); }}
                />
                <img
                    src={settingsIcon}
                    alt="Settings"
                    className={styles.actionIcon}
                    onClick={() => { setIsSettingsOpen(!isSettingsOpen); }}
                />
            </div>
        </div>
    );
};

export default UserInfo;