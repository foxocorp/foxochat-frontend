import { getDisplayName } from "@/codeLanguages";
import ActionPopup from "@components/Chat/ActionPopup/ActionPopup";
import CopyBubble from "@components/Chat/Bubbles/CopyBubble/Bubbles";
import Attachments from "@components/Chat/MessageAttachments/MessageAttachments";
import Avatar from "@components/Chat/MessageAvatar/MessageAvatar";
import MessageContent from "@components/Chat/MessageContent/MessageContent";
import MediaViewer from "@components/MediaViewer/MediaViewer";
import StateFailed from "@icons/chat/state-failed.svg";
import StateSending from "@icons/chat/state-sending.svg";
import StateSent from "@icons/chat/state-sent.svg";
import CopyIcon from "@icons/navigation/copy.svg";
import type {
	Attachment,
	MessageItemProps,
	PreComponentProps,
} from "@interfaces/interfaces";
import { wrapRichText } from "@lib/richTextProcessor/wrapRichText";
import {
	fetchFileAndGenerateThumbHash,
	timestampToHSV,
} from "@utils/functions";
import { Logger } from "@utils/logger";
import parse from "html-react-parser";
import { JSX } from "preact";
import { memo } from "preact/compat";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { thumbHashToDataURL } from "thumbhash";
import * as styles from "./MessageItem.module.scss";

const PreComponent = function PreComponent({
	className,
	language,
	codeHtml,
	codeText,
}: PreComponentProps) {
	const displayLanguage = getDisplayName(language ?? "text");
	const [isCopied, setIsCopied] = useState<boolean>(false);
	const duration = 1500;

	const handleCopy = useCallback(async (): Promise<void> => {
		if (isCopied || !codeText) return;
		try {
			await navigator.clipboard.writeText(codeText);
			setIsCopied(true);
		} catch (error) {
			Logger.error(`Copy failed: ${error}`);
		}
	}, [isCopied, codeText]);

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

	if (!codeHtml || !codeText) {
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
				<pre className={className || "language-text"}>
					<code>Error: Invalid code content</code>
				</pre>
			</div>
		);
	}

	const parsedContent = parse(codeHtml) || "Error: Failed to parse code";

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
				<code>{parsedContent}</code>
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

const MessageItem = ({
	content,
	created_at,
	author,
	currentUserId,
	showAuthorName,
	showAvatar,
	attachments = [],
	status = "sent",
	channelId,
	messageId,
	onDelete,
	onEdit,
	onReply,
	onForward,
}: MessageItemProps) => {
	const [isHovered, setIsHovered] = useState<boolean>(false);
	const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);
	const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
	const [thumbHashes, setThumbHashes] = useState<Record<string, string | null>>(
		{},
	);
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

	const htmlContent = useMemo(() => {
		if (!content) {
			Logger.debug(`Content is empty or invalid in MessageItem: ${content}`);
			return "";
		}
		try {
			const html = wrapRichText(content, { highlight: true });
			Logger.debug(
				`wrapRichText result for content:, ${content}, "->", ${html}`,
			);
			return html;
		} catch (error) {
			Logger.error(`Error processing content: ${error}`);
			return content;
		}
	}, [content]);

	useEffect(() => {
		const loadThumbHashes = async () => {
			const newThumbHashes: Record<string, string | null> = {};
			for (const att of attachments) {
				if (
					att?.uuid &&
					!thumbHashes[att.uuid] &&
					["png", "jpg", "jpeg", "gif", "webp"].includes(
						att.content_type?.split("/")[1] ?? "",
					)
				) {
					const url = `https://cdn.foxogram.su/attachments/${att.uuid}`;
					newThumbHashes[att.uuid] = await fetchFileAndGenerateThumbHash(
						url,
						att.content_type,
					);
				}
			}
			if (Object.keys(newThumbHashes).length > 0) {
				setThumbHashes((prev) => ({ ...prev, ...newThumbHashes }));
			}
		};
		void loadThumbHashes();
	}, [attachments]);

	const { h, s } = useMemo(
		() => timestampToHSV(author?.user?.created_at ?? 0),
		[author?.user?.created_at],
	);

	const avatarBg = useMemo(() => `hsl(${h}, ${s}%, 50%)`, [h, s]);

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

	const isMessageAuthor = useMemo(
		() => author?.user?.id === currentUserId,
		[author?.user?.id, currentUserId],
	);

	const formattedTime = useMemo(
		() =>
			new Date(created_at ?? Date.now()).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
		[created_at],
	);

	const avatarInitial = useMemo(() => {
		const name = author?.user?.display_name || author?.user?.username || "U";
		return name.charAt(0).toUpperCase();
	}, [author?.user?.display_name, author?.user?.username]);

	const authorName = useMemo(
		() => author?.user?.display_name || author?.user?.username || "Unknown",
		[author?.user?.display_name, author?.user?.username],
	);

	const decodeThumbHash = useCallback(
		(value: string | null | undefined): string | undefined => {
			if (!value || value.length === 0) return undefined;
			try {
				const binaryString = atob(value as unknown as string);
				const bytes = new Uint8Array(binaryString.length);
				for (let i = 0; i < binaryString.length; i++) {
					bytes[i] = binaryString.charCodeAt(i);
				}
				return thumbHashToDataURL(bytes);
			} catch (error) {
				Logger.warn(`Failed to decode thumbhash: ${error}`);
				return undefined;
			}
		},
		[],
	);

	const baseAttachments = useMemo(() => {
		const rawAttachments = Array.isArray(attachments)
			? attachments.slice()
			: [];
		return rawAttachments
			.map(
				(
					att: Attachment,
					idx: number,
				): (Attachment & { url: string; filename: string }) | null => {
					if (!att?.uuid || !att?.content_type) {
						Logger.warn(`Invalid attachment at index ${idx}: ${att}`);
						return null;
					}
					const extParts = att.content_type.split("/");
					const ext =
						extParts.length > 1
							? (extParts[1]?.toLowerCase() ?? extParts[0]?.toLowerCase() ?? "")
							: (extParts[0]?.toLowerCase() ?? "");
					const url = `https://cdn.foxogram.su/attachments/${att.uuid}`;
					const filename = att.filename || `${att.uuid}.${ext}`;
					return { ...att, url, filename };
				},
			)
			.filter(
				(att): att is Attachment & { url: string; filename: string } =>
					att !== null,
			);
	}, [attachments]);

	const validAttachments = useMemo(() => {
		return baseAttachments.map((att) => {
			const thumbUrl = decodeThumbHash(thumbHashes[att.uuid]);
			return {
				...att,
				...(thumbUrl !== undefined ? { thumbUrl } : {}),
			};
		});
	}, [baseAttachments, thumbHashes]);

	const renderContent = useCallback(
		(html: string | null | undefined): JSX.Element[] => {
			if (!html) {
				Logger.warn(`Invalid HTML in renderContent: ${html}`);
				return [<span key="invalid-html">Invalid content</span>];
			}

			const parser = new DOMParser();
			const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
			const elements: JSX.Element[] = [];

			if (!doc.body.firstChild) {
				Logger.warn(`No valid HTML content in renderContent: ${html}`);
				return [<span key="empty">Invalid content</span>];
			}

			const simpleHash = (str: string): string => {
				let hash = 0;
				for (let i = 0; i < str.length; i++) {
					const char = str.charCodeAt(i);
					hash = (hash << 5) - hash + char;
					hash = hash & hash;
				}
				return hash.toString(16);
			};

			const processNode = (node: Node, index: string): void => {
				if (node.nodeType === Node.TEXT_NODE && node.textContent) {
					const textKey = `text-${index}-${simpleHash(node.textContent)}`;
					elements.push(<span key={textKey}>{node.textContent}</span>);
				} else if (node.nodeType === Node.ELEMENT_NODE) {
					const element = node as Element;
					const elementKeyBase = `${index}-${element.tagName.toLowerCase()}`;
					if (
						element.tagName.toLowerCase() === "pre" &&
						element.className.startsWith("language-")
					) {
						const language =
							element.className.replace("language-", "") || "text";
						const codeElement = element.querySelector("code");
						const codeHtml = codeElement?.innerHTML ?? "";
						const codeText = codeElement?.textContent ?? "";
						const preKey = `pre-${elementKeyBase}-${language}-${simpleHash(codeText)}`;
						Logger.debug(
							`[renderContent] Rendering code block for language "${language}": ${codeHtml}`,
						);
						elements.push(
							<PreComponent
								key={preKey}
								className={element.className}
								language={language}
								codeHtml={codeHtml}
								codeText={codeText}
							/>,
						);
					} else if (element.tagName.toLowerCase() === "br") {
						elements.push(<br key={`br-${elementKeyBase}`} />);
					} else {
						Array.from(element.childNodes).forEach((child, childIndex) =>
							processNode(child, `${elementKeyBase}-${childIndex}`),
						);
					}
				}
			};

			Array.from(doc.body.firstChild.childNodes).forEach((node, index) =>
				processNode(node, String(index)),
			);
			return elements;
		},
		[],
	);

	const handleImageLoad = useCallback((uuid: string): void => {
		setLoadedImages((prev) => ({ ...prev, [uuid]: true }));
	}, []);

	const handleMediaClick = useCallback((index: number): void => {
		setMediaViewerIndex(index);
		setIsMediaViewerOpen(true);
	}, []);

	const handleDeleteAttachment = useCallback(
		(attachment: Attachment): void => {
			Logger.info("Delete attachment:", attachment?.uuid);
			if (onDelete) {
				onDelete();
			}
		},
		[onDelete],
	);

	return (
		<>
			<div
				className={`${styles.messageItem} ${isMessageAuthor ? styles.author : styles.receiver}`}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<Avatar
					author={author}
					showAvatar={showAvatar}
					avatarBg={avatarBg}
					avatarInitial={avatarInitial}
				/>

				<div className={styles.messageBubble}>
					<Attachments
						validAttachments={validAttachments}
						loadedImages={loadedImages}
						isMessageAuthor={isMessageAuthor}
						content={content}
						formattedTime={formattedTime}
						statusIcon={statusIcon}
						onImageLoad={handleImageLoad}
						onMediaClick={handleMediaClick}
					/>

					<MessageContent
						content={content}
						htmlContent={htmlContent}
						isMessageAuthor={isMessageAuthor}
						showAuthorName={showAuthorName}
						authorName={authorName}
						formattedTime={formattedTime}
						statusIcon={statusIcon}
						renderContent={renderContent}
					/>
				</div>

				{isHovered && isShiftPressed && (
					<ActionPopup
						isMessageAuthor={isMessageAuthor}
						channelId={channelId}
						messageId={messageId}
						onEdit={onEdit}
						onReply={onReply}
						onForward={onForward}
						onDelete={onDelete}
					/>
				)}
			</div>

			<MediaViewer
				isOpen={isMediaViewerOpen}
				attachments={validAttachments}
				initialIndex={mediaViewerIndex}
				authorName={authorName}
				authorAvatar={author?.user?.avatar?.uuid}
				createdAt={created_at ?? Date.now()}
				onClose={() => setIsMediaViewerOpen(false)}
				onDelete={handleDeleteAttachment}
			/>
		</>
	);
};

export default memo(MessageItem);
