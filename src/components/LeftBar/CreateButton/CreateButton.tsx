import CreateIcon from "@icons/chat/create.svg";
import { CreateButtonProps } from "@interfaces/interfaces";
import { memo } from "preact/compat";
import styles from "./CreateButton.module.scss";

const CreateButton = ({ onClick }: CreateButtonProps) => {
	return (
		<button
			className={styles.createButton}
			onClick={onClick}
			aria-label="Create new channel or group"
		>
			<img className={styles.plusIcon} alt={"Create chat"} src={CreateIcon} />
		</button>
	);
};

export default memo(CreateButton);
