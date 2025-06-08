export {};

declare global {
	interface Window {
		config: {
			cdnBaseUrl: string;
			apiUrl: string;
		};
	}
	const config: Window["config"];
}
