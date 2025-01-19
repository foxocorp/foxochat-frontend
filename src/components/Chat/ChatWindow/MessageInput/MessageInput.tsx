import { useState } from "preact/hooks";
import styles from "./MessageInput.module.css";
import mediaIcon from "@icons/chat/media.svg";
import sendIcon from "@icons/chat/paperplane.svg";
import React from "react";
import { MessageInputProps } from "@interfaces/chat.interface.ts";
import { apiMethods } from "@services/api/apiMethods";

const MessageInput = ({ channelId }: MessageInputProps) => {
    const [message, setMessage] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

    const handleSend = async () => {
        if (message.trim() === "" && files.length === 0) return;

        const attachments = files.length > 0
            ? await Promise.all(files.map((file) => file.arrayBuffer()))
            : undefined;

        try {
            await apiMethods.createMessage(channelId, {
                content: message,
                attachments: attachments?.map((buffer) => new Uint8Array(buffer)) ?? [],
            });

            setMessage("");
            setFiles([]);
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && (message.trim() !== "" || files.length > 0)) {
            void handleSend();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target as HTMLInputElement;
        if (input.files) {
            setFiles(Array.from(input.files));
        }
    };

    const handleSendMedia = () => {
        if (fileInputRef) {
            fileInputRef.click();
        }
    };

    return (
        <div className={styles["message-input-container"]}>
            <div className={styles["message-input-background"]}>
                <button onClick={handleSendMedia} className={styles["icon-button"]}>
                    <img src={mediaIcon} alt="Media" className={styles["icon"]} />
                </button>
                <input
                    type="text"
                    value={message}
                    onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setMessage((e.target as HTMLInputElement).value);
                    }}
                    placeholder="Write your message..."
                    className={styles["message-input"]}
                    onKeyDown={handleKeyDown}
                />
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className={styles["file-input"]}
                    ref={(input) => { setFileInputRef(input); }}
                    style={{ display: "none" }}
                />
                <button onClick={() => { void handleSend(); }} className={styles["icon-button"]}>
                    <img src={sendIcon} alt="Send" className={styles["icon"]} />
                </button>
            </div>
        </div>
    );
};

export default MessageInput;