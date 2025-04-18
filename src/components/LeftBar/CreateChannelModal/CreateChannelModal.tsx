import { useState, useRef, useEffect } from "preact/hooks";
import CreateIcon from "@icons/chat/create-black.svg";
import styles from "./CreateChannelModal.module.css";
import { apiMethods } from "@services/API/apiMethods";
import { chatStore } from "@store/chat/chatStore";
import { ChannelType } from "@foxogram/api-types";

interface Props {
    onClose: () => void;
    onCreate: (data: {
        name: string;
        displayName: string;
        members: string;
        channelType: ChannelType;
    }) => void;
}

const TYPE_OPTIONS = [
    { value: ChannelType.Channel, label: "Channel" },
    { value: ChannelType.Group, label: "Group" },
];

export default function CreateChannelModal({ onClose, onCreate }: Props) {
    const [name, setName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [members, setMembers] = useState("");
    const [channelType, setChannelType] = useState<ChannelType | null>(null);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsCreating(true);

        try {
            const created = await apiMethods.createChannel({
                display_name: displayName || name,
                name: name.replace(/\s+/g, "_").toLowerCase(),
                type: channelType,
            });

            await chatStore.fetchChannelsFromAPI();
            await chatStore.setCurrentChannel(created.id);
            onCreate({
                displayName: displayName || name,
                name,
                members,
                channelType,
            });
            onClose();
        } catch (error) {
            console.error("Error creating channel:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className={styles["overlay"]}>
            <div className={styles["modal"]} ref={modalRef}>
                <h2 className={styles["title"]}>Create channel</h2>

                <div className={styles["field"]}>
                    <label className={styles["label"]}>Display Name</label>
                    <input
                        className={styles["input"]}
                        placeholder="Foxogram display name"
                        value={displayName}
                        onInput={(e) => { setDisplayName((e.target as HTMLInputElement).value); }}
                    />
                </div>

                <div className={styles["field"]}>
                    <label className={styles["label"]}>
                        Name <span className={styles["required"]}>*</span>
                    </label>
                    <input
                        className={styles["input"]}
                        placeholder="Foxogram channel name"
                        value={name}
                        onInput={(e) => { setName((e.target as HTMLInputElement).value); }}
                        required
                    />
                </div>

                <div className={styles["field"]}>
                    <label className={styles["label"]}>Members</label>
                    <input
                        className={styles["input"]}
                        placeholder="@username"
                        value={members}
                        onInput={(e) => { setMembers((e.target as HTMLInputElement).value); }}
                    />
                </div>

                <div className={styles["field"]}>
                    <label className={styles["label"]}>
                        Type <span className={styles["required"]}>*</span>
                    </label>
                    <div className={styles["dropdown"]} ref={dropdownRef}>
                        <div
                            className={styles["dropdown-toggle"]}
                            onClick={() => { setDropdownOpen((prev) => !prev); }}
                        >
                            {channelType ? TYPE_OPTIONS.find((o) => o.value === channelType)?.label : "Select Type"}
                            <svg className={styles["caret"]} width="12" height="8" viewBox="0 0 12 8">
                                <path d="M1 1l5 6 5-6" stroke="#AAA" strokeWidth="2" fill="none" />
                            </svg>
                        </div>

                        {isDropdownOpen && (
                            <ul className={styles["dropdown-menu"]}>
                                {TYPE_OPTIONS.map((opt) => (
                                    <li
                                        key={opt.value}
                                        className={
                                            styles["dropdown-item"] +
                                            (opt.value === channelType ? ` ${styles["selected"]}` : "")
                                        }
                                        onClick={() => {
                                            setChannelType(opt.value);
                                            setDropdownOpen(false);
                                        }}
                                    >
                                        {opt.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className={styles["create"]}
                    disabled={!name.trim() || !channelType || isCreating}
                    onClick={ handleSubmit }
                >
                    <span>{isCreating ? "Creating..." : "Create"}</span>
                    <img src={CreateIcon} alt="Create" className={styles["icon"]} />
                </button>
            </div>
        </div>
    );
}
