import styles from "./ChatHeader.module.css";
import { ChatHeaderProps } from "@interfaces/chat.interface.ts";


const ChatHeader = ({ avatar, displayName, username, status }: ChatHeaderProps) => {
    const nameToDisplay = displayName || username;

    return (
        <div className={styles["chat-header"]}>
            {avatar ? (
                <img
                    src={avatar}
                    alt={`${nameToDisplay}'s avatar`}
                    className={styles["chat-header-avatar"]}
                />
            ) : (
                <div className={styles["default-avatar"]}>
                    {nameToDisplay.charAt(0).toUpperCase()}
                </div>
            )}
            <div className={styles["chat-header-info"]}>
                <p className={styles["chat-header-username"]}>{nameToDisplay}</p>
                <p className={styles["chat-header-status"]}>{status}</p>
            </div>
            <button className={styles["chat-header-edit"]}></button>
        </div>
    );
};

export default ChatHeader;
