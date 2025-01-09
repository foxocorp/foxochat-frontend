import { useState, useEffect } from "preact/hooks";
import styles from "./LoadingApp.module.css";
import foxogramLogo from "../../assets/foxogram.svg";

const Loading = ({ onLoaded }: { onLoaded: () => void }) => {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const handleLoad = () => {
			setIsLoading(false);
			onLoaded();
		};

		if (document.readyState === "complete") {
			handleLoad();
		} else {
			window.addEventListener("load", handleLoad);
		}

		return () => {
			window.removeEventListener("load", handleLoad);
		};
	}, [onLoaded]);

	if (!isLoading) {
		return null;
	}

	return (
		<div className={styles["loading-overlay"]}>
			<img src={foxogramLogo} alt="Logo" className={styles["logo"]} />
			<div className={styles["loading"]}>
				<div className={styles["loading-bar"]} />
			</div>
		</div>
	);
};

export default Loading;
