import styles from "./CreateButton.module.scss";
import CreateIcon from "@icons/chat/create.svg";

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
            <img className={styles.plusIcon} src={CreateIcon} />
        </button>
    );
};

export default CreateButton;
