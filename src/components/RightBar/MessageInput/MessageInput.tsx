import type { MessageInputProps } from "@interfaces/interfaces";
import appStore from "@store/app";
import { Logger } from "@utils/logger";
import { autorun } from "mobx";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import type React from "react";
import fileIcon from "@/assets/icons/right-bar/chat/file.svg";
import mediaIcon from "@/assets/icons/right-bar/chat/media.svg";
import sendIcon from "@/assets/icons/right-bar/chat/paperplane.svg";
import spoilerIcon from "@/assets/icons/right-bar/chat/spoiler.svg";
import trashIcon from "@/assets/icons/right-bar/mediaViewer/trash.svg";
import * as style from "./MessageInput.module.scss";

function SpoilerOverlay() {
	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				background: "rgba(0,0,0,0.28)",
				backdropFilter: "blur(6px)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				borderRadius: 10,
				zIndex: 2,
				pointerEvents: "none",
				transition: "background 0.2s",
			}}
		>
			<img src={spoilerIcon} alt="Spoiler" style={{ width: 32, height: 32 }} />
		</div>
	);
}

const MAX_FILES = 100;
const ERROR_DISPLAY_TIME = 7000;

const MessageInput = ({}: MessageInputProps) => {
	const [message, setMessage] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [filePreviews, setFilePreviews] = useState<Map<string, string>>(
		new Map(),
	);
	const [isSending, setIsSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isErrorHiding, setIsErrorHiding] = useState(false);
	const errorTimeoutRef = useRef<number | null>(null);

	const [fileSpoilers, setFileSpoilers] = useState<boolean[]>([]);

	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const messageSound = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		messageSound.current = new Audio("/sounds/fchat_sfx.mp3");
		messageSound.current.volume = 0.5;
	}, []);

	const clearError = () => {
		if (errorTimeoutRef.current) {
			window.clearTimeout(errorTimeoutRef.current);
		}
		setIsErrorHiding(true);
		errorTimeoutRef.current = window.setTimeout(() => {
			setError(null);
			setIsErrorHiding(false);
		}, 300);
	};

	const showError = (message: string) => {
		if (errorTimeoutRef.current) {
			window.clearTimeout(errorTimeoutRef.current);
		}
		setIsErrorHiding(false);
		setError(message);
		errorTimeoutRef.current = window.setTimeout(clearError, ERROR_DISPLAY_TIME);
	};

	const generateFileId = (file: File) =>
		`${file.name}-${file.size}-${file.lastModified}`;

	const validateFile = (_file: File): string | null => {
		return null;
	};

	const handleSend = async () => {
		if (
			(!message.trim() && !files.length) ||
			isSending ||
			appStore.isSendingMessage
		)
			return;

		try {
			setIsSending(true);
			clearError();

			const filesWithFlags = files.map((file, i) => {
				(file as any).flags = fileSpoilers[i] ? 1 : 0;
				return file;
			});

			await appStore.sendMessage(message, filesWithFlags);

			setMessage("");
			setFiles([]);
			setFilePreviews(new Map());
			fileInputRef.current && (fileInputRef.current.value = "");
			setFileSpoilers([]);

			messageSound.current?.play();
			textareaRef.current?.focus();
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to send message";
			showError(errorMessage);
			Logger.error(errorMessage);
		} finally {
			setIsSending(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			void handleSend();
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target as HTMLInputElement;
		if (!input || !input.files) return;

		const newFiles = Array.from(input.files);
		const validFiles: File[] = [];
		const newPreviews = new Map(filePreviews);
		const errors: string[] = [];

		for (const file of newFiles) {
			const error = validateFile(file);
			if (error) {
				errors.push(error);
				continue;
			}

			if (files.length + validFiles.length >= MAX_FILES) {
				errors.push(`Cannot add more than ${MAX_FILES} files`);
				break;
			}

			validFiles.push(file);
			const fileId = generateFileId(file);
			if (file.type.startsWith("image/")) {
				try {
					const url = URL.createObjectURL(file);
					newPreviews.set(fileId, url);
				} catch (error) {
					Logger.error(`Failed to create preview for ${file.name}: ${error}`);
				}
			}
		}

		setFileSpoilers((prev) => [...prev, ...newFiles.map(() => false)]);

		if (errors.length > 0) {
			showError(errors.join(", "));
		}

		setFiles((prevFiles) => [...prevFiles, ...validFiles]);
		setFilePreviews(newPreviews);
		setTimeout(() => {
			textareaRef.current?.focus();
		}, 0);
	};

	const handleSendMedia = () => {
		if (isSending || appStore.isSendingMessage) return;
		fileInputRef.current?.click();
	};

	const handleRemoveFile = (index: number, fileId: string) => {
		setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
		setFileSpoilers((prev) => prev.filter((_, i) => i !== index));
		setFilePreviews((prevPreviews) => {
			const newPreviews = new Map(prevPreviews);
			const url = newPreviews.get(fileId);
			if (url) {
				URL.revokeObjectURL(url);
				newPreviews.delete(fileId);
			}
			return newPreviews;
		});
	};

	const handleAddFilesFromEvent = useCallback(
		(files: File[]) => {
			const validFiles: File[] = [];
			const newPreviews = new Map(filePreviews);
			const errors: string[] = [];

			for (const file of files) {
				const error = validateFile(file);
				if (error) {
					errors.push(error);
					continue;
				}

				if (files.length + validFiles.length >= MAX_FILES) {
					errors.push(`Cannot add more than ${MAX_FILES} files`);
					break;
				}

				validFiles.push(file);
				const fileId = generateFileId(file);
				if (file.type.startsWith("image/")) {
					try {
						const url = URL.createObjectURL(file);
						newPreviews.set(fileId, url);
					} catch (error) {
						Logger.error(`Failed to create preview for ${file.name}: ${error}`);
					}
				}
			}

			if (errors.length > 0) {
				showError(errors.join(", "));
			}

			setFiles((prevFiles) => [...prevFiles, ...validFiles]);
			setFileSpoilers((prev) => [...prev, ...validFiles.map(() => false)]);
			setFilePreviews(newPreviews);
			setTimeout(() => {
				textareaRef.current?.focus();
			}, 0);
		},
		[filePreviews, validateFile, generateFileId, showError],
	);

	useEffect(() => {
		const handleAddFilesEvent = (e: CustomEvent) => {
			handleAddFilesFromEvent(e.detail.files);
		};

		window.addEventListener(
			"addFilesToQueue",
			handleAddFilesEvent as EventListener,
		);
		return () => {
			window.removeEventListener(
				"addFilesToQueue",
				handleAddFilesEvent as EventListener,
			);
		};
	}, [handleAddFilesFromEvent]);

	useEffect(() => {
		return () => {
			if (errorTimeoutRef.current) {
				window.clearTimeout(errorTimeoutRef.current);
			}
			filePreviews.forEach((url) => {
				URL.revokeObjectURL(url);
			});
		};
	}, []);

	useEffect(() => {
		if (textareaRef.current && containerRef.current) {
			const textarea = textareaRef.current;
			const container = containerRef.current;

			textarea.style.height = "auto";
			const maxHeight = 150;
			const minHeight = 40;
			const newHeight = Math.min(
				Math.max(textarea.scrollHeight, minHeight),
				maxHeight,
			);

			textarea.style.height = `${newHeight}px`;
			container.style.height = `${newHeight + 16}px`;
			textarea.style.overflowY =
				textarea.scrollHeight > maxHeight ? "scroll" : "hidden";
		}
	}, [message]);

	useEffect(() => {
		const focusTextarea = () => {
			if (textareaRef.current && !isSending) {
				textareaRef.current.focus();
			}
		};

		const dispose = autorun(() => {
			appStore.currentChannelId;
			setTimeout(focusTextarea, 0);
		});

		return () => {
			dispose();
		};
	}, [isSending]);

	const handleToggleFileSpoiler = (idx: number) => {
		setFileSpoilers((prev) => prev.map((v, i) => (i === idx ? !v : v)));
	};

	return (
		<div className={style.messageInputContainer}>
			{error && (
				<div className={`${style.error} ${isErrorHiding ? style.hiding : ""}`}>
					{error}
				</div>
			)}
			{files.length > 0 && (
				<>
					<div className={style.filePreviewList}>
						{files.map((file, index) => {
							const fileId = generateFileId(file);
							const isSpoiler = fileSpoilers[index];
							return (
								<div key={fileId} className={style.filePreviewItem}>
									{file.type.startsWith("image/") &&
									filePreviews.has(fileId) ? (
										<>
											<img
												src={filePreviews.get(fileId)}
												alt={file.name}
												className={style.filePreviewImage}
												style={{
													filter: isSpoiler ? "blur(12px)" : undefined,
													transition: "filter 0.3s ease-out",
												}}
											/>
											{isSpoiler && <SpoilerOverlay />}
										</>
									) : (
										<img
											src={fileIcon}
											alt="File Icon"
											className={style.filePreviewIcon}
										/>
									)}
									<div className={style.fileNameContainer}>
										<span className={style.fileName}>{file.name}</span>
										<button
											onClick={() => handleToggleFileSpoiler(index)}
											className={`${style.spoilerToggleButton} ${isSpoiler ? "active" : ""}`}
											type="button"
											title={isSpoiler ? "Remove spoiler" : "Mark as spoiler"}
										>
											<img
												src={spoilerIcon}
												alt="Spoiler"
												style={{ width: 16, height: 16 }}
											/>
										</button>
										<button
											onClick={() => handleRemoveFile(index, fileId)}
											className={style.removeFileButton}
											disabled={isSending || appStore.isSendingMessage}
										>
											<img
												src={trashIcon}
												alt="Remove"
												className={style.trashIcon}
											/>
										</button>
									</div>
								</div>
							);
						})}
					</div>
					<div className={style.mediaDivider} />
				</>
			)}
			<div className={style.messageInputBackground} ref={containerRef}>
				<button
					onClick={handleSendMedia}
					className={style.iconButton}
					disabled={isSending || appStore.isSendingMessage}
				>
					<img src={mediaIcon} alt="Media" className={style.icon} />
				</button>
				<textarea
					ref={textareaRef}
					value={message}
					onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
						const target = e.target as HTMLTextAreaElement;
						setMessage(target.value);
						clearError();
					}}
					placeholder="Write your message..."
					className={style.messageInput}
					onKeyDown={handleKeyDown}
					maxLength={5000}
					rows={1}
					disabled={isSending || appStore.isSendingMessage}
				/>
				<input
					type="file"
					multiple
					accept="image/*,video/*,application/pdf"
					onChange={handleFileChange}
					ref={fileInputRef}
					style={{ display: "none" }}
				/>
				<button
					onClick={() => void handleSend()}
					className={style.iconButton}
					disabled={
						isSending ||
						appStore.isSendingMessage ||
						(!message.trim() && !files.length)
					}
				>
					<img
						src={sendIcon}
						alt="Send"
						className={
							isSending ||
							appStore.isSendingMessage ||
							(!message.trim() && !files.length)
								? style.iconDisabled
								: style.icon
						}
					/>
				</button>
			</div>
		</div>
	);
};

export default MessageInput;
