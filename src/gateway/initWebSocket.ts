import { GatewayCloseCodes } from "foxogram.js";
import { WebSocketClient } from "./webSocketClient";

export const initWebSocket = (
	token: string | null,
	onUnauthorized?: () => void,
): WebSocketClient => {
	const hostname = window.location.hostname;

	const gatewayUrl =
		hostname === "localhost" || hostname.endsWith("dev.foxogram.su")
			? "wss://api.dev.foxogram.su"
			: hostname.endsWith("foxogram.su")
				? "wss://api.foxogram.su"
				: "wss://api.dev.foxogram.su";

	return new WebSocketClient(
		() => token,
		gatewayUrl,
		(event) => {
			if (event.code === Number(GatewayCloseCodes.Unauthorized)) {
				onUnauthorized?.();
			}
		},
		onUnauthorized,
	);
};
