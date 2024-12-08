import { useState, useEffect } from 'preact/hooks';
import './LoadingApp.module.css';

const Loading = () => {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const handleLoad = () => {
			setIsLoading(false);
		};

		window.addEventListener('load', handleLoad);

		return () => {
			window.removeEventListener('load', handleLoad);
		};
	}, []);

	if (!isLoading) {
		return null;
	}

	return (
		<div className="loading-overlay">
			<img src="../assets/foxogram-logo.svg" alt="logo" className="logo" />
			<div className="loading">
				<div className="loading-bar"></div>
			</div>
		</div>
	);
};

export default Loading;
