import { useEffect, useState } from "preact/hooks";
import styles from "./LoadingApp.module.scss";
import FoxogramLogo from "../../../public/foxogram.svg";

const Loading = ({ onLoaded, isLoading }: { onLoaded: () => void; isLoading: boolean }) => {
	const [isLogoLoaded, setIsLogoLoaded] = useState(false);

	useEffect(() => {
		const img = new Image();
		img.src = FoxogramLogo;
		img.onload = () => { setIsLogoLoaded(true); };
		img.onerror = () => { setIsLogoLoaded(true); };
	}, []);

	useEffect(() => {
		if (!isLoading && isLogoLoaded) {
			onLoaded();
		}
	}, [isLoading, isLogoLoaded, onLoaded]);

	if (!isLoading || !isLogoLoaded) {
		return null;
	}

	return (
		<div className={styles.loadingOverlay}>
			<img src={FoxogramLogo} alt="Foxogram Logo" className={styles.logo} />
			<div className={styles.loading}>
				<div className={styles.loadingBar} />
			</div>
		</div>
	);
};

export default Loading;