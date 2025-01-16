import { useState } from "preact/hooks";
import styles from "./MessageInput.module.css";
import mediaIcon from "@icons/chat/media.svg";
import sendIcon from "@icons/chat/paperplane.svg";
import React from "react";
import { MessageInputProps } from "@interfaces/chat.interface.ts";


const MessageInput = ({ onSendMessage, onSendMedia }: MessageInputProps) => {
    const [message, setMessage] = useState("");

    const handleSend = () => {
        if (message.trim() !== "") {
            onSendMessage(message);
            setMessage("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && message.trim() !== "") {
            handleSend();
        }
    };

    return (
        <div className={styles["message-input-container"]}>
            <div className={styles["message-input-background"]}>
                {onSendMedia && (
                    <button onClick={onSendMedia} className={styles["icon-button"]}>
                        <img src={mediaIcon} alt="Media" className={styles["icon"]} />
                    </button>
                )}
                <input
                    type="text"
                    value={message}
                    onInput={(e: any) => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    className={styles["message-input"]}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={handleSend} className={styles["icon-button"]}>
                    <img src={sendIcon} alt="Send" className={styles["icon"]} />
                </button>
            </div>
        </div>
    );
};

export default MessageInput;