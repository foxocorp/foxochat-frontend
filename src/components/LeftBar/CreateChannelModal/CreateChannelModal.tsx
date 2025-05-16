import { useState, useRef, useEffect } from "preact/hooks";
import CreateIcon from "@icons/chat/create-black.svg";
import styles from "./CreateChannelModal.module.scss";
import { ChannelType } from "@foxogram/api-types";
import { Props } from "@interfaces/interfaces";

export default function CreateChannelModal({ onClose, onCreate, type }: Props) {
    const [name, setName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [members, setMembers] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const isGroup = type === "group";
    const title = isGroup ? "New Group" : "New Channel";

    useEffect(() => {
        setIsVisible(true);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                handleClose();
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsCreating(true);

        try {
            onCreate({
                displayName: displayName || name,
                name,
                ...(isGroup && { members: members.split(",").map(m => m.trim()) }),
                channelType: isGroup ? ChannelType.Group : ChannelType.Channel,
            });

            handleClose();
        } catch (error) {
            console.error(`Error creating ${type}:`, error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className={`${styles.overlay} ${isVisible ? styles.show : ""} ${isClosing ? styles.hide : ""}`}>
            <div className={styles.modal} ref={modalRef}>
                <h2 className={styles.title}>{title}</h2>

                <div className={styles.field}>
                    <label className={styles.label}>
                        Display Name
                    </label>
                    <input
                        className={styles.input}
                        placeholder={isGroup ? "Group display name" : "Channel display name"}
                        value={displayName}
                        onInput={(e) => { setDisplayName((e.target as HTMLInputElement).value); }}
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>
                        Name <span className={styles.required}>*</span>
                    </label>
                    <input
                        className={styles.input}
                        placeholder={isGroup ? "Unique group name" : "Unique channel name"}
                        value={name}
                        onInput={(e) => { setName((e.target as HTMLInputElement).value); }}
                        required
                    />
                </div>

                {isGroup && (
                    <div className={styles.field}>
                        <label className={styles.label}>Members</label>
                        <input
                            className={styles.input}
                            placeholder="@Foxogram @Foxocorp"
                            value={members}
                            onInput={(e) => { setMembers((e.target as HTMLInputElement).value); }}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className={styles.create}
                    disabled={isCreating || !name.trim()}
                    onClick={handleSubmit}
                >
                    <span>{isCreating ? "Creating..." : "Create"}</span>
                    <img src={CreateIcon} alt="Create" className={styles.icon} />
                </button>
            </div>
        </div>
    );
}