import ReactMarkdown from "react-markdown";
import { useEffect, useMemo, useState } from "preact/hooks";
import styles from "./MessageItem.module.css";
import { MessageItemProps } from "@interfaces/interfaces";
import StateSending from "@icons/chat/state-sending.svg";
import StateSent from "@icons/chat/state-sent.svg";
import StateFailed from "@icons/chat/state-failed.svg";
import EditIcon from "@icons/chat/edit-message.svg";
import ReplyIcon from "@icons/chat/reply.svg";
import ForwardIcon from "@icons/chat/forward.svg";
import TrashIcon from "@icons/chat/trash.svg";
import FileIcon from "@icons/chat/file.svg";

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
        const down = (e: KeyboardEvent) => { if (e.key === "Shift") setIsShiftPressed(true); };
        const up = () => { setIsShiftPressed(false); };
        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, []);

    const timestampToHSV = (ts: number) => {
        const seconds = Math.floor(ts / 1000);
        const h = seconds % 360;
        const s = 20 + ((seconds % 1000) / 1000) * 40;
        return { h, s };
    };
    const safeAuthor = author ?? { user: { created_at: Date.now(), ...author.user } };
    const { h, s } = timestampToHSV(safeAuthor.user.created_at);
    const avatarBg = `hsl(${h}, ${s}%, 50%)`;

    const statusIcon = useMemo(() => {
        if (status === "sending") return StateSending;
        if (status === "failed") return StateFailed;
        return StateSent;
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

    const validAttachments = (attachments as (string | { url: string })[])
        .map(att => {
            const url = typeof att === "string" ? att : att.url;
            if (!url) return null;
            const parts = url.split("/");
            const fn = parts[parts.length - 1];
            const ext = fn.split(".").pop()?.toLowerCase() ?? "";
            return { url, filename: fn, ext };
        })
        .filter(Boolean);

    return (
        <div
            className={`${styles["message-item"]} ${
                isMessageAuthor ? styles["author"] : styles["receiver"]
            }`}
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
                            className={styles["avatar"]}
                            alt="User avatar"
                        />
                    ) : (
                        <div
                            className={styles["default-avatar"]}
                            style={{ backgroundColor: avatarBg }}
                        >
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
                            const isImg = ["png","jpg","jpeg","gif","webp"].includes(ext);
                            const isVid = ["mp4","webm","ogg"].includes(ext);
                            const isAud = ["mp3","wav","ogg"].includes(ext);
                            return (
                                <div key={idx} className={styles["attachment-container"]}>
                                    {isImg ? (
                                        <img src={url} alt={filename} className={styles["image-attachment"]} />
                                    ) : isVid ? (
                                        <video controls src={url} className={styles["video-attachment"]} />
                                    ) : isAud ? (
                                        <audio controls src={url} className={styles["audio-attachment"]} />
                                    ) : (
                                        <a href={url} download={filename} className={styles["file-attachment"]}>
                                            <FileIcon className={styles["file-icon"]} />
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
                        <span className={styles["timestamp"]}>{formattedTime}</span>
                        {isMessageAuthor && (
                            <img
                                src={statusIcon}
                                className={styles["status-icon"]}
                                alt="Status"
                            />
                        )}
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