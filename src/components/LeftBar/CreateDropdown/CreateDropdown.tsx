import ChannelIcon from "@/assets/icons/left-bar/channel.svg";
import PersonIcon from "@/assets/icons/left-bar/group.svg";
import { CreateDropdownProps } from "@interfaces/interfaces";
import { memo } from "preact/compat";
import { useEffect, useRef } from "preact/hooks";
import * as styles from "./CreateDropdown.module.scss";

const CreateDropdown = ({ onSelect, onClose }: CreateDropdownProps) => {
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div ref={dropdownRef} className={styles.dropdown}>
			<div className={styles.menu}>
				<button
					className={styles.item}
					onClick={() => {
						onSelect("group");
					}}
				>
					<img src={PersonIcon} alt={"PersonIcon"} />
					New Group
				</button>
				<button
					className={styles.item}
					onClick={() => {
						onSelect("channel");
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
