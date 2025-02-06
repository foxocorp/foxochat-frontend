import ReactMarkdown from "react-markdown";
import rehypeHighlight from 'rehype-highlight'
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import styles from "./MessageItem.module.css";
import { MessageItemProps } from "@interfaces/chat.interface";

const FALLBACK_USER = {
    id: -1,
    username: "Unknown",
    display_name: "Unknown User",
    avatar: "",
    type: "user",
    created_at: Date.now(),
    email: "",
    flags: 0,
};

const FALLBACK_MEMBER = {
    id: -1,
    user: FALLBACK_USER,
    channel: {
        id: -1,
        name: "Unknown Channel",
        display_name: "Unknown Channel",
        icon: "",
        type: "text",
        member_count: 0,
        owner: FALLBACK_USER,
        created_at: Date.now(),
    },
    permissions: 0,
    joined_at: Date.now(),
};

const MessageItem = ({ content, created_at, author, currentUserId, showAuthorName, attachments = [] }: MessageItemProps) => {
    const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);

    const safeAuthor = useMemo(() => author ?? FALLBACK_MEMBER, [author]);

    const isMessageAuthor = useMemo(() => safeAuthor.user.id === currentUserId, [safeAuthor.user.id, currentUserId]);

    const formattedTime = useMemo(() =>
            new Date(created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        [created_at],
    );

    const avatarUrl = safeAuthor.user.avatar || null;

    const validAttachments = useMemo(() =>
            attachments
                .map(att => {
                    console.log("Processing attachment:", att);

                    return att.content_type.startsWith("image/")
                        ? {
                            url: `https://cdn.foxogram.su/attachments/${att.hash}`,
                            type: att.content_type,
                            filename: att.filename,
                        }
                        : null;
                })
                .filter(Boolean),
        [attachments],
    );

    const closeOverlay = useCallback(() => { setSelectedImage(undefined); }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") closeOverlay();
    }, [closeOverlay]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => { document.removeEventListener("keydown", handleKeyDown); };
    }, [handleKeyDown]);

    return (
        <div className={`${styles["message-item"]} ${isMessageAuthor ? styles["author"] : styles["receiver"]}`}>
            <div className={styles["avatar-container"]}>
                {avatarUrl ? (
                    <img src={avatarUrl} alt="User avatar" className={styles["avatar"]} loading="lazy" />
                ) : (
                    <div className={styles["default-avatar"]}>{safeAuthor.user.display_name.charAt(0).toUpperCase()}</div>
                )}
            </div>

            <div className={styles["content-wrapper"]}>
                {validAttachments.map((attachment, index) => (
                    <div key={index} className={styles["image-container"]}>
                        <img
                            src={attachment.url}
                            alt={attachment.filename}
                            className={styles["message-image"]}
                            loading="lazy"
                            onClick={() => { setSelectedImage(attachment.url); }}
                        />
                        <div className={styles["filename"]}>{attachment.filename}</div>
                    </div>
                ))}

                {content && (
                    <div className={styles["text-content"]}>
                        {showAuthorName && !isMessageAuthor && (
                            <div className={styles["author-name"]}>
                                {safeAuthor.user.display_name || safeAuthor.user.username}
                            </div>
                        )}
                        <div className={styles["message-text"]}>
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                        <div className={styles["timestamp"]}>{formattedTime}</div>
                    </div>
                )}
            </div>

            {selectedImage && (
                <div className={styles["image-overlay"]} onClick={closeOverlay}>
                    <img src={selectedImage} alt="Attachment" className={styles["message-image"]} loading="lazy" />
                </div>
            )}
        </div>
    );
};

export default MessageItem;