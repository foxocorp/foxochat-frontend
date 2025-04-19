import styles from "./CreateButton.module.css";
import CreateIcon from "@icons/chat/create.svg";

interface CreateButtonProps {
    onClick: () => void;
}

const CreateButton = ({ onClick }: CreateButtonProps) => {
    return (
        <button
            className={styles["create-button"]}
            onClick={onClick}
            aria-label="Create new channel or group"
        >
            <img className={styles["plus-icon"]} src={CreateIcon} />
        </button>
    );
};

export default CreateButton;