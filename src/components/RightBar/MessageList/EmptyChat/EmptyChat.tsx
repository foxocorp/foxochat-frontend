import { renderEmojisToJSX } from "@utils/emoji";
import styles from "./EmptyChat.module.scss";

const EmptyChat = () => {
	return (
		<div className={styles.emptyChat}>
			<div className={styles.icon}>
				<span role="img" aria-label="chat-icon">
					{renderEmojisToJSX("🤔")}
				</span>
			</div>
			<h2 className={styles.title}>It’s kind of empty here...</h2>
			<p className={styles.description}>
				Would you like to fix it? Start the conversation first!
			</p>
		</div>
	);
};

export default EmptyChat;
