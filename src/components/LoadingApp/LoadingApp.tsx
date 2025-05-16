import { useEffect } from "preact/hooks";
import styles from "./LoadingApp.module.scss";
import foxogramLogo from "../../../public/foxogram.svg";

const Loading = ({ onLoaded, isLoading }: { onLoaded: () => void, isLoading: boolean }) => {
	useEffect(() => {
		if (!isLoading) {
			onLoaded();
		}
	}, [isLoading, onLoaded]);

	if (!isLoading) {
		return null;
	}

	return (
		<div className={styles.loadingOverlay}>
			<img src={foxogramLogo} alt="Logo" className={styles.logo} />
			<div className={styles.loading}>
				<div className={styles.loadingBar} />
			</div>
		</div>
	);
};

export default Loading;
