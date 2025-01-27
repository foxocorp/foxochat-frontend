import styles from "./ChatHeader.module.css";
import { ChatHeaderProps } from "@interfaces/chat.interface.ts";
import { apiMethods } from "@services/API/apiMethods.ts";
import { useEffect, useState } from "preact/hooks";

const ChatHeader = ({ avatar, displayName, username, channelId }: ChatHeaderProps) => {
    const nameToDisplay = displayName ?? username;

    const [participantsCount, setParticipantsCount] = useState(0);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const members = await apiMethods.membersList(channelId);
                setParticipantsCount(members.length || 0);
            } catch (error) {
                console.error("Failed to fetch members:", error);
            }
        };

        if (channelId) void fetchMembers();
    }, [channelId]);

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
                <div className={styles["chat-header-members"]}>
                    <span className={styles["members-count"]}>
                        • {participantsCount} Members
                    </span>
                </div>
            </div>
            <button className={styles["chat-header-edit"]} />
        </div>
    );
};

export default ChatHeader;