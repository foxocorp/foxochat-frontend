import { useState, useEffect } from "preact/hooks";
import { apiMethods } from "@services/api/apiMethods.ts";
import styles from "./UserInfo.module.css";
import settingsIcon from "@icons/navigation/settings.svg";
import accountSwitchIcon from "@icons/navigation/account-switch.svg";
import { UserInfoProps } from "@interfaces/chat.interface.ts";


const UserInfo = ({ username, avatar, status }: UserInfoProps) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAccountSwitchOpen, setIsAccountSwitchOpen] = useState(false);
    const [userData, setUserData] = useState<{ username: string; avatar: string; status: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = async () => {
        try {
            const user = await apiMethods.getCurrentUser();
            if (user) {
                setUserData({
                    username: user.username,
                    avatar: user.avatar,
                    status: status || "Unknown",
                });
                console.log(user);
            } else {
                setError("User data is unavailable.");
            }
        } catch {
            setError("Failed to load user data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className={styles["user-info"]}>
            <img
                src={userData?.avatar || avatar}
                alt={`${userData?.username || username} Avatar`}
                className={styles["user-avatar"]}
            />
            <div className={styles["user-details"]}>
                <p className={styles["username"]}>{userData?.username || username}</p>
                <p className={styles["status"]}>{userData?.status || status}</p>
            </div>
            <div className={styles["user-actions"]}>
                <img
                    src={accountSwitchIcon}
                    alt="Switch Account"
                    className={styles["action-icon"]}
                    onClick={() => setIsAccountSwitchOpen(!isAccountSwitchOpen)}
                />
                <img
                    src={settingsIcon}
                    alt="Settings"
                    className={styles["action-icon"]}
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                />
            </div>
        </div>
    );
};

export default UserInfo;