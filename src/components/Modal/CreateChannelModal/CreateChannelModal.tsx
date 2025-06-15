import CreateIcon from "@/assets/icons/auth/auth-create.svg";
import { CreateChannelModalProps } from "@interfaces/interfaces";
import { ChannelType } from "foxochat.js";
import { memo } from "preact/compat";
import { useEffect, useRef, useState } from "preact/hooks";
import * as styles from "./CreateChannelModal.module.scss";

const CreateChannelModal = ({
	onClose,
	onCreate,
	type,
	renderError,
	nameError,
	nameErrorMessage,
	resetErrors,
}: CreateChannelModalProps) => {
	const [name, setName] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [members, setMembers] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);
	const [isPublic, setIsPublic] = useState(false);

	const isGroup = type === "group";
	const title = isGroup ? "New Group" : "New Channel";

	useEffect(() => {
		setIsVisible(true);
		setName("");
		setDisplayName("");
		setMembers("");
		setIsPublic(false);
		resetErrors();
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
		resetErrors();
		setIsClosing(true);
		setIsVisible(false);
		setTimeout(onClose, 300);
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		if (!name.trim()) return;

		setIsCreating(true);

		try {
			const success = await onCreate({
				displayName: displayName || name,
				name,
				...(isGroup && { members: members.split(",").map((m) => m.trim()) }),
				channelType: isGroup ? ChannelType.Group : ChannelType.Channel,
				public: isPublic,
			});

			if (success) {
				handleClose();
			}
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div
			className={`${styles.overlay} ${isVisible ? styles.show : ""} ${
				isClosing ? styles.hide : ""
			}`}
		>
			<div className={styles.modal} ref={modalRef}>
				<h2 className={styles.title}>{title}</h2>
				<div className={styles.field}>
					<label className={styles.label}>Display Name</label>
					<input
						className={styles.input}
						placeholder={
							isGroup ? "Group display name" : "Channel display name"
						}
						value={displayName}
						onInput={(e) =>
							setDisplayName((e.target as HTMLInputElement).value)
						}
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
						onInput={(e) => {
							setName((e.target as HTMLInputElement).value);
							resetErrors();
						}}
						required
					/>
					{renderError("name", nameError, nameErrorMessage)}
				</div>
				{isGroup && (
					<div className={styles.field}>
						<label className={styles.label}>Members</label>
						<input
							className={styles.input}
							placeholder="@foxochat @foxocorp"
							value={members}
							onInput={(e) => setMembers((e.target as HTMLInputElement).value)}
						/>
					</div>
				)}
				<label className={styles.checkboxContainer}>
					<input
						type="checkbox"
						checked={isPublic}
						onChange={(e) => setIsPublic(e.currentTarget.checked)}
					/>
					<span className={styles.labelText}>Make public</span>
				</label>
				<button
					type="button"
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
};

export default memo(CreateChannelModal);
