import FileIcon from "@icons/chat/file.svg";
import { AttachmentsProps } from "@interfaces/interfaces";
import { memo } from "preact/compat";
import * as styles from "./MessageAttachments.module.scss";

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
	if (!validAttachments.length) return null;

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

				return (
					<div key={idx} className={styles.attachmentContainer}>
						{isImg ? (
							<img
								src={isLoaded ? att.url : (att.thumbUrl ?? att.url)}
								alt={att.filename}
								className={`${styles.imageAttachment} ${isLoaded ? styles.loaded : styles.blurred}`}
								onLoad={() => onImageLoad(att.uuid)}
								onError={() => onImageLoad(att.uuid)}
								onClick={() => onMediaClick(idx)}
								style={{ cursor: "pointer" }}
							/>
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
