import { useState, useEffect, useRef } from "preact/hooks";
import styles from "./MessageInput.module.css";
import mediaIcon from "@icons/chat/media.svg";
import sendIcon from "@icons/chat/paperplane.svg";
import trashIcon from "@icons/chat/trash.svg";
import fileIcon from "@icons/chat/file.svg";
import { MessageInputProps } from "@interfaces/interfaces";
import chatStore from "@store/chat/index";
import { Logger } from "@utils/logger";
import React from "react";

const MAX_FILES = 10;

const MessageInput = ({}: MessageInputProps) => {
    const [message, setMessage] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<Map<string, string>>(new Map());
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const generateFileId = (file: unknown) =>
        `${file.name}-${file.size}-${file.lastModified}`;

    const handleSend = async () => {
        if ((!message.trim() && !files.length) || chatStore.isSendingMessage) return;

        try {
            setMessage("");
            setFiles([]);
            setFilePreviews(new Map());
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            await chatStore.sendMessage(message, files);
        } catch (error) {
            Logger.error(error instanceof Error ? error.message : "An unknown error occurred");
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
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
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
            filePreviews.forEach((url) => { URL.revokeObjectURL(url); });
        };
    }, []);

    useEffect(() => {
        if (textareaRef.current && containerRef.current) {
            const textarea = textareaRef.current;
            const container = containerRef.current;
            textarea.style.height = "auto";
            const maxHeight = 150;
            const minHeight = 40;
            const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
            textarea.style.height = `${newHeight}px`;
            container.style.height = `${newHeight + 16}px`;
            textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "scroll" : "hidden";
        }
    }, [message]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    return (
        <div className={styles["message-input-container"]}>
            {files.length > 0 && (
                <div className={styles["file-preview-list"]}>
                    {files.map((file, index) => {
                        const fileId = generateFileId(file);
                        return (
                            <div key={fileId} className={styles["file-preview-item"]}>
                                {file.type.startsWith("image/") && filePreviews.has(fileId) ? (
                                    <img
                                        src={filePreviews.get(fileId)}
                                        alt={file.name}
                                        className={styles["file-preview-image"]}
                                    />
                                ) : (
                                    <img
                                        src={fileIcon}
                                        alt="File Icon"
                                        className={styles["file-preview-icon"]}
                                    />
                                )}
                                <div className={styles["file-name-container"]}>
                                    <span className={styles["file-name"]}>{file.name}</span>
                                    <button
                                        onClick={() => handleRemoveFile(index, fileId)}
                                        className={styles["remove-file-button"]}
                                        aria-label={`Remove ${file.name}`}
                                    >
                                        <img src={trashIcon} alt="Remove" className={styles["trash-icon"]} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <div className={styles["message-input-background"]} ref={containerRef}>
                <button
                    onClick={handleSendMedia}
                    className={styles["icon-button"]}
                    disabled={chatStore.isSendingMessage}
                    aria-label="Attach media"
                >
                    <img src={mediaIcon} alt="Media" className={styles["icon"]} />
                </button>
                <textarea
                    ref={textareaRef}
                    value={message}
                    onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setMessage(e.target.value);
                    }}
                    placeholder="Write your message..."
                    className={styles["message-input"]}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={chatStore.isSendingMessage}
                    aria-label="Message input"
                />
                <input
                    type="file"
                    multiple
                    accept="image/*,video/*,application/pdf"
                    onChange={handleFileChange}
                    className={styles["file-input"]}
                    ref={fileInputRef}
                    style={{ display: "none" }}
                />
                <button
                    onClick={() => void handleSend()}
                    className={styles["icon-button"]}
                    disabled={chatStore.isSendingMessage}
                    aria-label="Send message"
                >
                    <img
                        src={sendIcon}
                        alt="Send"
                        className={chatStore.isSendingMessage ? styles["icon-disabled"] : styles["icon"]}
                    />
                </button>
            </div>
        </div>
    );
};

export default MessageInput;