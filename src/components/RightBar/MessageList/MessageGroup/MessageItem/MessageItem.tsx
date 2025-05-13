import ReactMarkdown from "react-markdown";
import { useEffect, useMemo, useState } from "preact/hooks";
import styles from "./MessageItem.module.css";
import { MessageItemProps } from "@interfaces/interfaces";
import { APIAttachment } from "@foxogram/api-types";

import StateSending from "@icons/chat/state-sending.svg";
import StateSent from "@icons/chat/state-sent.svg";
import StateFailed from "@icons/chat/state-failed.svg";
import EditIcon from "@icons/chat/edit-message.svg";
import ReplyIcon from "@icons/chat/reply.svg";
import ForwardIcon from "@icons/chat/forward.svg";
import TrashIcon from "@icons/chat/trash.svg";
import FileIcon from "@icons/chat/file.svg";

import { timestampToHSV } from "@utils/functions";

interface Props extends MessageItemProps {
    showAuthorName: boolean;
    showAvatar: boolean;
}

export default function MessageItem({
                                        content,
                                        created_at,
                                        author,
                                        currentUserId,
                                        showAuthorName,
                                        showAvatar,
                                        attachments = [],
                                        status = "sent",
                                        onDelete,
                                        onEdit,
                                        onReply,
                                        onForward,
                                    }: Props) {
    const [isHovered, setIsHovered] = useState(false);
    const [isShiftPressed, setIsShiftPressed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Shift") setIsShiftPressed(true);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Shift") setIsShiftPressed(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    const safeAuthor = author ?? {
        user: {
            id: 0,
            created_at: Date.now(),
            display_name: null,
            username: "",
            avatar: null,
        },
    };
    const { h, s } = timestampToHSV(safeAuthor.user.created_at);
    const avatarBg = `hsl(${h}, ${s}%, 50%)`;

    const statusIcon = useMemo(() => {
        switch (status) {
            case "sending":
                return StateSending;
            case "failed":
                return StateFailed;
            default:
                return StateSent;
        }
    }, [status]);

    const isMessageAuthor = safeAuthor.user.id === currentUserId;

    const formattedTime = useMemo(
        () =>
            new Date(created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        [created_at],
    );

    const avatarInitial = useMemo(() => {
        const name = safeAuthor.user.display_name || safeAuthor.user.username || "U";
        return name.charAt(0).toUpperCase();
    }, [safeAuthor.user.display_name, safeAuthor.user.username]);

    const validAttachments = useMemo(() => {
        return attachments
            .map((att: APIAttachment | string): { url: string; filename: string; ext: string } | null => {
                const url = typeof att === "string" ? att : att.uuid;
                if (!url) return null;

                const filename = typeof att === "string" ? att.split("/").pop() ?? "file" : att.filename;

                const lastDotIndex = filename.lastIndexOf(".");
                const ext = lastDotIndex > 0 ? filename.slice(lastDotIndex + 1).toLowerCase() : "";

                return { url, filename, ext };
            })
            .filter((att): att is { url: string; filename: string; ext: string } => att !== null);
    }, [attachments]);

    return (
        <div
            className={`${styles["message-item"]} ${isMessageAuthor ? styles.author : styles.receiver}`}
            onMouseEnter={() => { setIsHovered(true); }}
            onMouseLeave={() => { setIsHovered(false); }}
        >
            {showAvatar ? (
                <div
                    className={`${styles["avatar-container"]} ${
                        isMessageAuthor ? styles["avatar-author"] : styles["avatar-other"]
                    }`}
                >
                    {safeAuthor.user.avatar ? (
                        <img
                            src={safeAuthor.user.avatar}
                            className={styles.avatar}
                            alt="User avatar"
                        />
                    ) : (
                        <div className={styles["default-avatar"]} style={{ backgroundColor: avatarBg }}>
                            {avatarInitial}
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles["avatar-placeholder"]} />
            )}

            <div className={styles["message-bubble"]}>
                {validAttachments.length > 0 && (
                    <div className={styles["attachments-grid"]}>
                        {validAttachments.map(({ url, filename, ext }, idx) => {
                            const isImg = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);
                            const isVid = ["mp4", "webm", "ogg"].includes(ext);
                            const isAud = ["mp3", "wav", "ogg"].includes(ext);
                            return (
                                <div key={idx} className={styles["attachment-container"]}>
                                    {isImg ? (
                                        <img
                                            src={url}
                                            alt={filename}
                                            className={styles["image-attachment"]}
                                        />
                                    ) : isVid ? (
                                        <video
                                            controls
                                            src={url}
                                            className={styles["video-attachment"]}
                                        />
                                    ) : isAud ? (
                                        <audio
                                            controls
                                            src={url}
                                            className={styles["audio-attachment"]}
                                        />
                                    ) : (
                                        <a
                                            href={url}
                                            download={filename}
                                            className={styles["file-attachment"]}
                                        >
                                            <img src={FileIcon} className={styles["file-icon"]} alt="File" />
                                            <span>{filename}</span>
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className={styles["text-content"]}>
                    {showAuthorName && !isMessageAuthor && (
                        <div className={styles["author-name"]}>
                            {safeAuthor.user.display_name || safeAuthor.user.username}
                        </div>
                    )}
                    {content && (
                        <div className={styles["message-text"]}>
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                    )}

                    <div className={styles["message-footer"]}>
                        {isMessageAuthor && (
                            <img
                                src={statusIcon}
                                className={styles["status-icon"]}
                                alt="Status"
                            />
                        )}
                        <span className={styles.timestamp}>{formattedTime}</span>
                    </div>
                </div>
            </div>

            {isHovered && isShiftPressed && (
                <div className={styles["action-popup"]}>
                    {isMessageAuthor && (
                        <button onClick={onEdit} aria-label="Edit">
                            <img src={EditIcon} alt="Edit" width={24} height={24} />
                        </button>
                    )}
                    <button onClick={onReply} aria-label="Reply">
                        <img src={ReplyIcon} alt="Reply" width={24} height={24} />
                    </button>
                    <button onClick={onForward} aria-label="Forward">
                        <img src={ForwardIcon} alt="Forward" width={24} height={24} />
                    </button>
                    {isMessageAuthor && (
                        <button onClick={onDelete} aria-label="Delete">
                            <img src={TrashIcon} alt="Delete" width={24} height={24} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}