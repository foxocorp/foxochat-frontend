import { useEffect, useMemo, useState } from "preact/hooks";
import parse from "html-react-parser";
import styles from "./MessageItem.module.scss";
import type { MessageItemProps, PreComponentProps } from "@interfaces/interfaces";
import type { APIAttachment } from "@foxogram/api-types";
import { wrapRichText } from "@lib/richTextProcessor/wrapRichText";
import { getDisplayName } from "@/codeLanguages";
import { timestampToHSV } from "@utils/functions";

import StateSending from "@icons/chat/state-sending.svg";
import StateSent from "@icons/chat/state-sent.svg";
import StateFailed from "@icons/chat/state-failed.svg";
import EditIcon from "@icons/chat/edit-message.svg";
import ReplyIcon from "@icons/chat/reply.svg";
import ForwardIcon from "@icons/chat/forward.svg";
import TrashIcon from "@icons/chat/trash.svg";
import FileIcon from "@icons/chat/file.svg";
import CopyIcon from "@icons/navigation/copy.svg";
import { JSX } from "preact";
import { Logger } from "@utils/logger";
import { CopyBubble } from "@components/chat/bubbles";

const PreComponent = ({ className, language, codeHtml, codeText }: PreComponentProps) => {
    const displayLanguage = getDisplayName(language ?? "text");
    const [isCopied, setIsCopied] = useState(false);
    const duration = 1500;

    const handleCopy = async () => {
        if (isCopied || !codeText) return;

        try {
            await navigator.clipboard.writeText(codeText);
            setIsCopied(true);
        } catch (error) {
            Logger.error("Copy failed:", error);
        }
    };

    useEffect(() => {
        let timer: number;
        if (isCopied) {
            timer = setTimeout(() => { setIsCopied(false); }, duration);
        }
        return () => { clearTimeout(timer); };
    }, [isCopied, duration]);

    return (
        <div className={styles.codeBlockWrapper}>
            <div className={styles.codeHeader}>
                <span className={styles.languageName}>{displayLanguage}</span>
                <button
                    className={styles.copyButton}
                    onClick={handleCopy}
                    aria-label="Copy code"
                >
                    <img src={CopyIcon} alt="Copy" className={styles.copyIcon} />
                </button>
            </div>
            <pre className={className}>
                <code>{parse(codeHtml)}</code>
            </pre>
            <CopyBubble
                show={isCopied}
                text="Code copied to clipboard!"
                duration={duration}
                onHide={() => { setIsCopied(false); }}
            />
        </div>
    );
};

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
                                    }: MessageItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [htmlContent, setHtmlContent] = useState("");

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

    useEffect(() => {
        const processContent = () => {
            if (!content) {
                setHtmlContent("");
                return;
            }

            try {
                const html = wrapRichText(content, { highlight: true });
                setHtmlContent(html);
            } catch (error) {
                Logger.error("Error processing content:", error);
                setHtmlContent(content);
            }
        };

        processContent();
    }, [content]);

    const { h, s } = timestampToHSV(author.user.created_at);
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

    const isMessageAuthor = author.user.id === currentUserId;

    const formattedTime = useMemo(
        () => new Date(created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        [created_at],
    );

    const avatarInitial = useMemo(() => {
        const name = author.user.display_name || author.user.username || "U";
        return name.charAt(0).toUpperCase();
    }, [author.user.display_name, author.user.username]);

    const validAttachments = useMemo(() => {
        return attachments
            .map((att: APIAttachment | string): { url: string; filename: string; ext: string } | null => {
                const url = typeof att === "string" ? att : att.uuid;
                if (!url) return null;

                const filename = typeof att === "string" ? (att.split("/").pop() ?? "file") : att.filename;
                const lastDotIndex = filename.lastIndexOf(".");
                const ext = lastDotIndex > 0 ? filename.slice(lastDotIndex + 1).toLowerCase() : "";

                return { url, filename, ext };
            })
            .filter((att): att is { url: string; filename: string; ext: string } => att !== null);
    }, [attachments]);

    const renderContent = (html: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
        const elements: JSX.Element[] = [];
        let nodeIndex = 0;

        const processNode = (node: Node): void => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent) {
                elements.push(<span key={`text-${nodeIndex++}`}>{node.textContent}</span>);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                if (element.tagName.toLowerCase() === "pre" && element.className.startsWith("language-")) {
                    const language = element.className.replace("language-", "");
                    const codeElement = element.querySelector("code");
                    if (codeElement) {
                        const codeHtml = codeElement.innerHTML;
                        const codeText = codeElement.textContent ?? "";
                        Logger.debug(`[renderContent] Rendering code block for language "${language}": ${codeHtml}`);
                        elements.push(
                            <PreComponent
                                key={`pre-${nodeIndex++}`}
                                className={element.className}
                                language={language}
                                codeHtml={codeHtml}
                                codeText={codeText}
                            />,
                        );
                    } else {
                        elements.push(<span key={`empty-${nodeIndex++}`} />);
                    }
                } else if (element.tagName.toLowerCase() === "br") {
                    elements.push(<br key={`br-${nodeIndex++}`} />);
                } else {
                    Array.from(element.childNodes).forEach(processNode);
                }
            }
        };

        Array.from(doc.body.firstChild?.childNodes ?? []).forEach(processNode);
        return elements;
    };

    return (
        <div
            className={`${styles.messageItem} ${isMessageAuthor ? styles.author : styles.receiver}`}
            onMouseEnter={() => { setIsHovered(true); }}
            onMouseLeave={() => { setIsHovered(false); }}
        >
            {showAvatar ? (
                <div
                    className={`${styles.avatarContainer} ${
                        isMessageAuthor ? styles.avatarAuthor : styles.avatarOther
                    }`}
                >
                    {author.user.avatar ? (
                        <img
                            src={author.user.avatar}
                            className={styles.avatar}
                            alt="User avatar"
                        />
                    ) : (
                        <div className={styles.defaultAvatar} style={{ backgroundColor: avatarBg }}>
                            {avatarInitial}
                        </div>
                    )}
                </div>
            ) : (
                <div className={styles.avatarPlaceholder} />
            )}

            <div className={styles.messageBubble}>
                {validAttachments.length > 0 && (
                    <div className={styles.attachmentsGrid}>
                        {validAttachments.map(({ url, filename, ext }, idx) => {
                            const isImg = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);
                            const isVid = ["mp4", "webm", "ogg"].includes(ext);
                            const isAud = ["mp3", "wav", "ogg"].includes(ext);
                            return (
                                <div key={idx} className={styles.attachmentContainer}>
                                    {isImg ? (
                                        <img src={url} alt={filename} className={styles.imageAttachment} />
                                    ) : isVid ? (
                                        <video controls src={url} className={styles.videoAttachment} />
                                    ) : isAud ? (
                                        <audio controls src={url} className={styles.audioAttachment} />
                                    ) : (
                                        <a href={url} download={filename} className={styles.fileAttachment}>
                                            <img src={FileIcon} className={styles.fileIcon} alt="File" />
                                            <span>{filename}</span>
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                {showAuthorName && !isMessageAuthor && (
                    <div className={styles.authorName}>{author.user.display_name || author.user.username}</div>
                )}
                <div className={styles.textContent}>
                    {content && (
                        <>
                            {isMessageAuthor ? (
                                <>
                                    <div className={styles.messageText}>{renderContent(htmlContent)}</div>
                                    <div className={styles.messageFooter}>
                                        <img src={statusIcon} className={styles.statusIcon} alt="Status" />
                                        <span className={styles.timestamp}>{formattedTime}</span>
                                    </div>
                                </>
                            ) : (
                                <div className={styles.receiverMessageRow}>
                                    <div className={styles.messageText}>{renderContent(htmlContent)}</div>
                                    <span className={styles.timestamp}>{formattedTime}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {isHovered && isShiftPressed && (
                <div className={styles.actionPopup}>
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