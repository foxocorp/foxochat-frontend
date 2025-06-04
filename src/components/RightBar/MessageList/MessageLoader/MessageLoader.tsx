import * as styles from "./MessageLoader.module.scss";

const MessageLoader = ({ isVisible = true }: { isVisible?: boolean }) => {
	return (
		<div
			className={`${styles.loaderWrapper} ${isVisible ? styles.isVisible : ""}`}
		>
			<div className={styles.youSpinMeRound}>
				<svg className={styles.preloaderCircular} viewBox="0 0 100 100">
					<circle
						className={styles.preloaderPathNew}
						cx="50"
						cy="50"
						r="32"
						fill="none"
						stroke-miterlimit="10"
					/>
				</svg>
			</div>
		</div>
	);
};

export default MessageLoader;
