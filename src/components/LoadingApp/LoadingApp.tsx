import { useEffect, useState } from "preact/hooks";
import FoxoChatLogo from "../../../public/foxochat.svg";
import * as styles from "./LoadingApp.module.scss";

const Loading = ({
	onLoaded,
	isLoading,
}: {
	onLoaded: () => void;
	isLoading: boolean;
}) => {
	const [isLogoLoaded, setIsLogoLoaded] = useState(false);

	useEffect(() => {
		const img = new Image();
		img.src = FoxoChatLogo;
		img.onload = () => {
			setIsLogoLoaded(true);
		};
		img.onerror = () => {
			setIsLogoLoaded(true);
		};
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
			<img src={FoxoChatLogo} alt="FoxoChat Logo" className={styles.logo} />
			<div className={styles.loading}>
				<div className={styles.loadingBar} />
			</div>
		</div>
	);
};

export default Loading;
