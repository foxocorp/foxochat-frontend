import EditIcon from "@icons/chat/edit-message.svg";
import ForwardIcon from "@icons/chat/forward.svg";
import ReplyIcon from "@icons/chat/reply.svg";
import TrashIcon from "@icons/chat/trash.svg";
import { ActionPopupProps } from "@interfaces/interfaces";
import { memo } from "preact/compat";
import * as styles from "./ActionPopup.module.scss";

const ActionPopup = ({
	isMessageAuthor,
	onEdit,
	onReply,
	onForward,
	onDelete,
}: ActionPopupProps) => {
	const handleEdit = () => {
		onEdit();
	};

	const handleReply = () => {
		onReply();
	};

	const handleForward = () => {
		onForward();
	};

	const handleDelete = () => {
		onDelete();
	};

	return (
		<div
			className={`${styles.actionPopup} ${
				isMessageAuthor ? styles.authorMessage : styles.receiverMessage
			}`}
		>
			{isMessageAuthor && (
				<button onClick={handleEdit}>
					<img src={EditIcon} alt="Edit" />
				</button>
			)}
			<button onClick={handleReply}>
				<img src={ReplyIcon} alt="Reply" />
			</button>
			<button onClick={handleForward}>
				<img src={ForwardIcon} alt="Forward" />
			</button>
			{isMessageAuthor && (
				<button className={styles.deleteMessage} onClick={handleDelete}>
					<img src={TrashIcon} alt="Delete" />
				</button>
			)}
		</div>
	);
};

export default memo(ActionPopup);
