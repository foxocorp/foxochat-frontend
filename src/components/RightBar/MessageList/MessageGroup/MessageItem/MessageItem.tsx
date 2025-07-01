import ContextMenu from "@components/Base/ContextMenu/ContextMenu";
import { useContextMenu } from "@components/Base/ContextMenu/useContextMenu";
import ActionPopup from "@components/Chat/ActionPopup/ActionPopup";
import CopyBubble from "@components/Chat/Bubbles/CopyBubble/Bubbles";
import Attachments from "@components/Chat/MessageAttachments/MessageAttachments";
import Avatar from "@components/Chat/MessageAvatar/MessageAvatar";
import MessageContent from "@components/Chat/MessageContent/MessageContent";
import MediaViewer from "@components/MediaViewer/MediaViewer";
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
import type { Element as HtmlParserElement } from "html-react-parser";
import parse, {
	domToReact,
	Element,
	type HTMLReactParserOptions,
} from "html-react-parser";
import type { JSX } from "preact";
import { memo } from "preact/compat";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { thumbHashToDataURL } from "thumbhash";
import ClockIcon from "@/assets/icons/right-bar/chat/chat-overview/clock.svg";
import CopyIcon from "@/assets/icons/right-bar/chat/chat-overview/message-copy.svg";
import EditIcon from "@/assets/icons/right-bar/chat/chat-overview/message-edit.svg";
import ForwardIcon from "@/assets/icons/right-bar/chat/chat-overview/message-forward.svg";
import ReplyIcon from "@/assets/icons/right-bar/chat/chat-overview/message-reply.svg";
import SelectIcon from "@/assets/icons/right-bar/chat/chat-overview/message-select.svg";
import PinIcon from "@/assets/icons/right-bar/chat/chat-overview/pin.svg";
import TrashIcon from "@/assets/icons/right-bar/chat/chat-overview/trash.svg";
import StateFailed from "@/assets/icons/right-bar/chat/message/state-failed.svg";
import StateSending from "@/assets/icons/right-bar/chat/message/state-sending.svg";
import StateSent from "@/assets/icons/right-bar/chat/message/state-sent.svg";
import { getDisplayName } from "@/codeLanguages";
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
		let timer: ReturnType<typeof setTimeout>;
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
	const contextMenu = useContextMenu();

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
			return "";
		}
		try {
			return wrapRichText(content, { highlight: true });
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
					const url = `${config.cdnBaseUrl}${att.uuid}`;
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

	const { background: avatarBg } = useMemo(
		() => timestampToHSV(author.user.created_at),
		[author.user.created_at],
	);

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
				): (Attachment & { url: string; filename: string }) | null => {
					if (!att?.uuid || !att?.content_type) {
						return null;
					}
					const extParts = att.content_type.split("/");
					const ext =
						extParts.length > 1
							? (extParts[1]?.toLowerCase() ?? extParts[0]?.toLowerCase() ?? "")
							: (extParts[0]?.toLowerCase() ?? "");
					const url = `${config.cdnBaseUrl}${att.uuid}`;
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
			if (!html) return [];

			const options: HTMLReactParserOptions = {
				replace: (domNode) => {
					const el = domNode as HtmlParserElement;
					if (
						el.type === "tag" &&
						el.name === "pre" &&
						el.attribs &&
						el.attribs.class &&
						el.attribs.class.startsWith("language-")
					) {
						const language =
							el.attribs.class.replace("language-", "") || "text";
						const codeElement = el.children.find(
							(child) => child instanceof Element && child.name === "code",
						) as Element | undefined;
						const codeHtml = codeElement
							? domToReact(
									codeElement.children as unknown as import("html-react-parser").DOMNode[],
								)
							: "";
						let codeText = "";
						if (codeElement && codeElement.children) {
							codeText = codeElement.children
								.map((child) => ("data" in child ? (child as any).data : ""))
								.join("");
						}
						return (
							<PreComponent
								className={el.attribs.class}
								language={language}
								codeHtml={codeHtml as unknown as string}
								codeText={codeText}
							/>
						);
					}
					return undefined;
				},
			};

			const parsed = parse(html, options);
			if (Array.isArray(parsed)) return parsed as JSX.Element[];
			if (parsed == null) return [];
			return [parsed as JSX.Element];
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
				className={`${styles.messageItem} ${contextMenu.isOpen ? styles.contextActive : ""} ${isMessageAuthor ? styles.author : styles.receiver}`}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onContextMenu={(e) => {
					e.preventDefault();
					const items: import("@components/Base/ContextMenu/ContextMenu").ContextMenuItem[] =
						[];

					items.push({
						icon: <img src={PinIcon} alt="Pin" />,
						label: "Pin",
						onClick: () => {
							/* TODO pin */
						},
					});

					if (isMessageAuthor) {
						items.push({
							icon: <img src={EditIcon} alt="Edit" />,
							label: "Edit",
							onClick: () => {
								if (onEdit) onEdit();
							},
						});
					}

					items.push({ divider: true });

					items.push({
						icon: <img src={ReplyIcon} alt="Reply" />,
						label: "Reply",
						onClick: () => {
							if (onReply) onReply();
						},
					});

					items.push({
						icon: <img src={ForwardIcon} alt="Forward" />,
						label: "Forward",
						onClick: () => {
							if (onForward) onForward();
						},
					});

					items.push({
						icon: <img src={SelectIcon} alt="Select" />,
						label: "Select",
						onClick: () => {
							/* TODO select */
						},
					});

					items.push({
						icon: <img src={CopyIcon} alt="Copy" />,
						label: "Copy text",
						onClick: () => {
							navigator.clipboard.writeText(content ?? "");
						},
					});

					items.push({ divider: true });

					if (isMessageAuthor) {
						items.push({
							icon: <img src={TrashIcon} alt="Delete" />,
							label: "Delete",
							onClick: () => {
								if (onDelete) onDelete();
							},
							danger: true,
						});
						items.push({ divider: true });
					}

					items.push({
						icon: <img src={ClockIcon} alt="Copy" />,
						label: `Edited at ${formattedTime}`,
						disabled: true,
					});

					contextMenu.open(e.pageX, e.pageY, items);
				}}
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

			{contextMenu.isOpen && (
				<ContextMenu
					x={contextMenu.x}
					y={contextMenu.y}
					items={contextMenu.items}
					onClose={contextMenu.close}
				/>
			)}

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
