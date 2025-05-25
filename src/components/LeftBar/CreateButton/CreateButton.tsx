import styles from "./CreateButton.module.scss";
import CreateIcon from "@icons/chat/create.svg";
import { memo } from "preact/compat";

interface CreateButtonProps {
    onClick: () => void;
}

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
