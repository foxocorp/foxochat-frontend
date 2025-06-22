import ChannelIcon from "@/assets/icons/left-bar/channel.svg";
import PersonIcon from "@/assets/icons/left-bar/group.svg";
import { CreateDropdownProps } from "@interfaces/interfaces";
import { memo } from "preact/compat";
import { useEffect, useRef, useState } from "preact/hooks";
import * as styles from "./CreateDropdown.module.scss";

const ANIMATION_DURATION = 200;

const CreateDropdown = ({ onSelect, onClose, registerCloseHandler }: CreateDropdownProps) => {
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [isClosing, setIsClosing] = useState(false);

	const startClosing = () => {
		if (isClosing) return;
		setIsClosing(true);
	};

	useEffect(() => {
		if (registerCloseHandler) {
			registerCloseHandler(startClosing);
		}
	}, []);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				startClosing();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				startClosing();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	useEffect(() => {
		if (!isClosing) return;
		const timer = setTimeout(() => {
			onClose();
		}, ANIMATION_DURATION);
		return () => clearTimeout(timer);
	}, [isClosing]);

	return (
		<div
			ref={dropdownRef}
			className={`${styles.dropdown} ${isClosing ? styles.closing : ""}`}
		>
			<div className={styles.menu}>
				<button
					className={styles.item}
					onClick={() => {
						onSelect("group");
						startClosing();
					}}
				>
					<img src={PersonIcon} alt={"PersonIcon"} />
					New Group
				</button>
				<button
					className={styles.item}
					onClick={() => {
						onSelect("channel");
						startClosing();
					}}
				>
					<img src={ChannelIcon} alt={"ChannelIcon"} />
					New Channel
				</button>
			</div>
		</div>
	);
};

export default memo(CreateDropdown);
