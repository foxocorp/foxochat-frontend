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
	return (
		<div className={styles.actionPopup}>
			{isMessageAuthor && (
				<button onClick={onEdit} aria-label="Edit">
					<img src={EditIcon} alt="Edit" width={24} height={24} />
				</button>
			)}
			<button onClick={onReply} aria-label="Reply">
				<img src={ReplyIcon} alt="Reply" width={24} height={24} />
			</button>
			<button onClick={onForward} aria-label="Forward">
				<img src={ForwardIcon} alt="Forward" width={24} height={24} />
			</button>
			{isMessageAuthor && (
				<button onClick={onDelete} aria-label="Delete">
					<img src={TrashIcon} alt="Delete" width={24} height={24} />
				</button>
			)}
		</div>
	);
};

export default memo(ActionPopup);
