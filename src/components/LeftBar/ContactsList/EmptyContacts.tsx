import type { EmptyContactsProps } from "@interfaces/interfaces";
import * as styles from "./EmptyContacts.module.scss";

const EmptyContacts = ({ onCreateChat }: EmptyContactsProps) => {
	const handleCreateChat = (e: MouseEvent) => {
		if (onCreateChat) onCreateChat(e);
	};

	return (
		<div className={styles.emptyContacts}>
			<div className={styles.emptyContactsContainer}>
				<div className={styles.mainText}>
					Can't find the right contact here?
				</div>
				<div className={styles.subText} onClick={handleCreateChat}>
					Create new chat
				</div>
			</div>
		</div>
	);
};

export default EmptyContacts; 