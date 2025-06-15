import fileIcon from "@/assets/icons/right-bar/chat/file.svg";
import mediaIcon from "@/assets/icons/right-bar/chat/media.svg";
import sendIcon from "@/assets/icons/right-bar/chat/paperplane.svg";
import trashIcon from "@/assets/icons/right-bar/mediaViewer/trash.svg";
import { MessageInputProps } from "@interfaces/interfaces";
import appStore from "@store/app";
import { Logger } from "@utils/logger";
import { autorun } from "mobx";
import { useEffect, useRef, useState } from "preact/hooks";
import React from "react";
import * as style from "./MessageInput.module.scss";

const MAX_FILES = 10;

const MessageInput = ({}: MessageInputProps) => {
	const [message, setMessage] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [filePreviews, setFilePreviews] = useState<Map<string, string>>(
		new Map(),
	);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const generateFileId = (file: File) =>
		`${file.name}-${file.size}-${file.lastModified}`;

	const handleSend = async () => {
		if ((!message.trim() && !files.length) || appStore.isSendingMessage) return;

		try {
			setMessage("");
			setFiles([]);
			setFilePreviews(new Map());
			fileInputRef.current && (fileInputRef.current.value = "");
			await appStore.sendMessage(message, files);
			textareaRef.current?.focus();
		} catch (error) {
			Logger.error(error instanceof Error ? error.message : "Unknown error");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			void handleSend();
			e.preventDefault();
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target;
		if (!input.files) return;

		const newFiles = Array.from(input.files);
		const validFiles: File[] = [];
		const newPreviews = new Map(filePreviews);

		for (const file of newFiles) {
			const allowedTypes = ["image/", "video/", "application/pdf"];
			if (!allowedTypes.some((type) => file.type.startsWith(type))) {
				Logger.warn(`File ${file.name} is not a supported type`);
				continue;
			}

			if (files.length + validFiles.length >= MAX_FILES) {
				Logger.warn(`Cannot add more than ${MAX_FILES} files`);
				break;
			}

			validFiles.push(file);
			const fileId = generateFileId(file);
			if (file.type.startsWith("image/")) {
				const url = URL.createObjectURL(file);
				newPreviews.set(fileId, url);
			}
		}

		setFiles((prevFiles) => [...prevFiles, ...validFiles]);
		setFilePreviews(newPreviews);
	};

	const handleSendMedia = () => {
		fileInputRef.current?.click();
	};

	const handleRemoveFile = (index: number, fileId: string) => {
		setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
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

	useEffect(() => {
		return () => {
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
		textareaRef.current?.focus();
	}, []);

	useEffect(() => {
		const dispose = autorun(() => {
			appStore.currentChannelId;
			setTimeout(() => textareaRef.current?.focus(), 0);
		});

		return () => {
			dispose();
		};
	}, []);

	return (
		<div className={style.messageInputContainer}>
			{files.length > 0 && (
				<div className={style.filePreviewList}>
					{files.map((file, index) => {
						const fileId = generateFileId(file);
						return (
							<div key={fileId} className={style.filePreviewItem}>
								{file.type.startsWith("image/") && filePreviews.has(fileId) ? (
									<img
										src={filePreviews.get(fileId)}
										alt={file.name}
										className={style.filePreviewImage}
									/>
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
										onClick={() => {
											handleRemoveFile(index, fileId);
										}}
										className={style.removeFileButton}
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
			)}
			<div className={style.messageInputBackground} ref={containerRef}>
				<button
					onClick={handleSendMedia}
					className={style.iconButton}
					disabled={appStore.isSendingMessage}
				>
					<img src={mediaIcon} alt="Media" className={style.icon} />
				</button>
				<textarea
					ref={textareaRef}
					value={message}
					onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
						setMessage(e.target.value);
					}}
					placeholder="Write your message..."
					className={style.messageInput}
					onKeyDown={handleKeyDown}
					rows={1}
					disabled={appStore.isSendingMessage}
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
					disabled={appStore.isSendingMessage}
				>
					<img
						src={sendIcon}
						alt="Send"
						className={
							appStore.isSendingMessage ? style.iconDisabled : style.icon
						}
					/>
				</button>
			</div>
		</div>
	);
};

export default MessageInput;
