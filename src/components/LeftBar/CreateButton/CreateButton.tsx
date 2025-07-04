import CreateIcon from "@/assets/icons/left-bar/navigation/createButton.svg";
import { CreateButtonProps } from "@interfaces/interfaces";
import { memo } from "preact/compat";
import * as styles from "./CreateButton.module.scss";

const CreateButton = ({ onClick }: CreateButtonProps) => {
	return (
		<button
			className={styles.createButton}
			onMouseDown={(e) => {
				e.stopPropagation();
			}}
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
			aria-label="Create new channel or group"
		>
			<img className={styles.plusIcon} alt={"Create chat"} src={CreateIcon} />
		</button>
	);
};

export default memo(CreateButton);
