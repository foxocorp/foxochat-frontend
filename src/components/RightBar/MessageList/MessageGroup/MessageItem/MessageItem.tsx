import { JSX } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import parse from "html-react-parser";
import styles from "./MessageItem.module.scss";
import type { Attachment, MessageItemProps, PreComponentProps } from "@interfaces/interfaces";

import { wrapRichText } from "@lib/richTextProcessor/wrapRichText";
import { getDisplayName } from "@/codeLanguages";
import { fetchFileAndGenerateThumbHash, timestampToHSV } from "@utils/functions";
import { thumbHashToDataURL } from "thumbhash";

import StateSending from "@icons/chat/state-sending.svg";
import StateSent from "@icons/chat/state-sent.svg";
import StateFailed from "@icons/chat/state-failed.svg";
import EditIcon from "@icons/chat/edit-message.svg";
import ReplyIcon from "@icons/chat/reply.svg";
import ForwardIcon from "@icons/chat/forward.svg";
import TrashIcon from "@icons/chat/trash.svg";
import FileIcon from "@icons/chat/file.svg";
import CopyIcon from "@icons/navigation/copy.svg";

import { Logger } from "@utils/logger";
import { CopyBubble } from "@components/Chat/Bubbles";
import { MediaViewer } from "@components/MediaViewer/MediaViewer";

const PreComponent = ({ className, language, codeHtml, codeText }: PreComponentProps) => {
    const displayLanguage = getDisplayName(language ?? "text");
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const duration = 1500;

    const handleCopy = async (): Promise<void> => {
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
            timer = setTimeout(() => {
                setIsCopied(false);
            }, duration);
        }
        return () => {
            clearTimeout(timer);
        };
    }, [isCopied, duration]);

    return (
        <div className={styles.codeBlockWrapper}>
            <div className={styles.codeHeader}>
                <span className={styles.languageName}>{displayLanguage}</span>
                <button className={styles.copyButton} onClick={handleCopy} aria-label="Copy code">
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
                onHide={() => {
                    setIsCopied(false);
                }}
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
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);
    const [htmlContent, setHtmlContent] = useState<string>("");
    const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
    const [thumbHashes, setThumbHashes] = useState<Record<string, string | null>>({});
    const [isMediaViewerOpen, setIsMediaViewerOpen] = useState<boolean>(false);
    const [mediaViewerIndex, setMediaViewerIndex] = useState<number>(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if (e.key === "Shift") setIsShiftPressed(true);
        };
        const handleKeyUp = (e: KeyboardEvent): void => {
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
        const processContent = (): void => {
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

    useEffect(() => {
        const loadThumbHashes = async (): Promise<void> => {
            const newThumbHashes: Record<string, string | null> = {};
            for (const att of attachments) {
                if (
                    att.uuid &&
                    !thumbHashes[att.uuid] &&
                    ["png", "jpg", "jpeg", "gif", "webp"].includes(att.content_type.split("/")[1] ?? "")
                ) {
                    const url = `https://cdn.foxogram.su/attachments/${att.uuid}`;
                    newThumbHashes[att.uuid] = await fetchFileAndGenerateThumbHash(url, att.content_type);
                }
            }
            setThumbHashes((prev) => ({ ...prev, ...newThumbHashes }));
        };
        void loadThumbHashes();
    }, [attachments, thumbHashes]);

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
        const rawAttachments = Array.isArray(attachments) ? attachments.slice() : [];

        return rawAttachments
            .map(
                (att: Attachment): (Attachment & { url: string; thumbUrl?: string }) | null => {
                    const rawAtt = { ...att };

                    if (!rawAtt.uuid || !rawAtt.content_type) {
                        Logger.warn("Invalid attachment (missing uuid or content_type):", rawAtt);
                        return null;
                    }

                    const extParts = rawAtt.content_type.split("/");
                    const ext = extParts.length > 1 ? extParts[1].toLowerCase() : extParts[0].toLowerCase() || "";
                    const url = `https://cdn.foxogram.su/attachments/${rawAtt.uuid}`;
                    const filename = rawAtt.filename ?? `${rawAtt.uuid}.${ext}`;
                    const thumbUrl = thumbHashes[rawAtt.uuid]
                        ? thumbHashToDataURL(atob(thumbHashes[rawAtt.uuid] || ""))
                        : undefined;

                    return { ...rawAtt, url, filename, thumbUrl };
                },
            )
            .filter((att): att is Attachment & { url: string; thumbUrl?: string } => att !== null);
    }, [attachments, thumbHashes]);

    const renderContent = (html: string): JSX.Element[] => {
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

    const handleImageLoad = (uuid: string): void => {
        setLoadedImages((prev) => ({ ...prev, [uuid]: true }));
    };

    const handleMediaClick = (index: number): void => {
        setMediaViewerIndex(index);
        setIsMediaViewerOpen(true);
    };

    const handleDeleteAttachment = (attachment: Attachment): void => {
        Logger.info("Delete attachment:", attachment.uuid);
        if (onDelete) {
            onDelete();
        }
    };

    return (
        <>
            <div
                className={`${styles.messageItem} ${isMessageAuthor ? styles.author : styles.receiver}`}
                onMouseEnter={() => {
                    setIsHovered(true);
                }}
                onMouseLeave={() => {
                    setIsHovered(false);
                }}
            >
                {showAvatar ? (
                    <div
                        className={`${styles.avatarContainer} ${
                            isMessageAuthor ? styles.avatarAuthor : styles.avatarOther
                        }`}
                    >
                        {author.user.avatar ? (
                            <img src={author.user.avatar} className={styles.avatar} alt="User avatar" />
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
                            {validAttachments.map((att, idx) => {
                                const isImg = ["png", "jpg", "jpeg", "gif", "webp"].includes(
                                    att.content_type.split("/")[1] ?? "",
                                );

                                const isVideo = ["mp4", "webm", "ogg"].includes(att.content_type.split("/")[1] ?? "");
                                const isAudio = ["mp3", "wav", "ogg"].includes(att.content_type.split("/")[1] ?? "");
        
                                const isLoaded = loadedImages[att.uuid] ?? !isImg;

                                return (
                                    <div key={idx} className={styles.attachmentContainer}>
                                        {isImg ? (
                                            <img
                                                src={isLoaded ? att.url : att.thumbUrl ?? att.url}
                                                alt={att.filename}
                                                className={`${styles.imageAttachment} ${isLoaded ? styles.loaded : styles.blurred}`}
                                                onLoad={() => {
                                                    handleImageLoad(att.uuid);
                                                }}
                                                onError={() => {
                                                    handleImageLoad(att.uuid);
                                                }}
                                                onClick={() => { handleMediaClick(idx); }}
                                                style={{ cursor: "pointer" }}
                                            />
                                        ) : isVideo ? (
                                            <video
                                                controls
                                                src={att.url}
                                                className={styles.videoAttachment}
                                                onClick={() => { handleMediaClick(idx); }}
                                                style={{ cursor: "pointer" }}
                                            />
                                        ) : isAudio ? (
                                            <audio controls src={att.url} className={styles.audioAttachment} />
                                        ) : (
                                            <a href={att.url} download={att.filename} className={styles.fileAttachment}>
                                                <img src={FileIcon} className={styles.fileIcon} alt="File" />
                                                <span>{att.filename}</span>
                                            </a>
                                        )}
                                        {!content && idx === validAttachments.length - 1 && (
                                            <div className={styles.attachmentFooter}>
                                                {isMessageAuthor && (
                                                    <img src={statusIcon} className={styles.statusIcon} alt="Status" />
                                                )}
                                                <span
                                                    className={`${styles.attachmentTimestamp} ${isMessageAuthor ? styles.author : ""}`}
                                                >
                          {formattedTime}
                        </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {showAuthorName && !isMessageAuthor && (
                        <div className={styles.authorName}>{author.user.display_name || author.user.username}</div>
                    )}
                    {content && (
                        <div className={styles.textContent}>
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
                        </div>
                    )}
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

            <MediaViewer
                isOpen={isMediaViewerOpen}
                attachments={validAttachments}
                initialIndex={mediaViewerIndex}
                authorName={author.user.display_name || author.user.username}
                authorAvatar={author.user.avatar}
                createdAt={created_at}
                onClose={() => { setIsMediaViewerOpen(false); }}
                onDelete={handleDeleteAttachment}
            />
        </>
    );
}