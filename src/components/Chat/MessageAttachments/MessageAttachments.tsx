import FileIcon from "@/assets/icons/right-bar/chat/file.svg";
import { AttachmentsProps } from "@interfaces/interfaces";
import { useState, memo, useRef } from "preact/compat";
import * as styles from "./MessageAttachments.module.scss";
import SpoilerOverlay from "./SpoilerOverlay";

const Attachments = ({
	validAttachments,
	loadedImages,
	isMessageAuthor,
	content,
	formattedTime,
	statusIcon,
	onImageLoad,
	onMediaClick,
}: AttachmentsProps) => {
	const [revealed, setRevealed] = useState<{ [uuid: string]: boolean }>({});
	const imageRefs = useRef<{ [uuid: string]: HTMLImageElement | null }>({});

	if (!validAttachments.length) return null;

	const handleReveal = (uuid: string) => {
		setRevealed((prev) => ({ ...prev, [uuid]: true }));
	};

	return (
		<div className={styles.attachmentsGrid}>
			{validAttachments.map((att, idx) => {
				const isImg = ["png", "jpg", "jpeg", "gif", "webp"].includes(
					att.content_type.split("/")[1] ?? "",
				);
				const isVideo = ["mp4", "webm", "ogg"].includes(
					att.content_type.split("/")[1] ?? "",
				);
				const isAudio = ["mp3", "wav", "ogg"].includes(
					att.content_type.split("/")[1] ?? "",
				);
				const isLoaded = loadedImages[att.uuid] ?? !isImg;
				const isSpoiler = (att.flags & 1) === 1;

				return (
					<div key={idx} className={styles.attachmentContainer}>
						{isImg ? (
							<div style={{ position: "relative", width: "100%" }}>
								<img
									ref={(el) => { imageRefs.current[att.uuid] = el; }}
									src={isLoaded ? att.url : (att.thumbUrl ?? att.url)}
									alt={att.filename}
									className={`${styles.imageAttachment} ${isSpoiler && !revealed[att.uuid] ? '' : styles.loaded}`}
									onLoad={() => onImageLoad(att.uuid)}
									onError={() => onImageLoad(att.uuid)}
									onClick={() => {
										if (isSpoiler && !revealed[att.uuid]) handleReveal(att.uuid);
										else onMediaClick(idx);
									}}
									style={{
										cursor: isSpoiler && !revealed[att.uuid] ? "pointer" : "pointer",
										transition: "filter 0.4s cubic-bezier(.4,0,.2,1)"
									}}
								/>
								{isSpoiler && !revealed[att.uuid] && isLoaded && (
									<SpoilerOverlay 
										visible={!revealed[att.uuid]} 
										onReveal={() => handleReveal(att.uuid)}
										originalImage={imageRefs.current[att.uuid] || null}
									/>
								)}
							</div>
						) : isVideo ? (
							<video
								controls
								src={att.url}
								className={styles.videoAttachment}
								onClick={() => onMediaClick(idx)}
								style={{ cursor: "pointer" }}
							/>
						) : isAudio ? (
							<audio
								controls
								src={att.url}
								className={styles.audioAttachment}
							/>
						) : (
							<a
								href={att.url}
								download={att.filename}
								className={styles.fileAttachment}
							>
								<img src={FileIcon} className={styles.fileIcon} alt="File" />
								<span>{att.filename}</span>
							</a>
						)}
						{!content && idx === validAttachments.length - 1 && (
							<div className={styles.attachmentFooter}>
								{isMessageAuthor && (
									<img
										src={statusIcon}
										className={styles.statusIcon}
										alt="Status"
									/>
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
	);
};

export default memo(Attachments);
