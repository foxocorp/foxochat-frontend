import { GatewayCloseCodes } from "foxogram.js";
import { WebSocketClient } from "./webSocketClient";

export const initWebSocket = (
	token: string | null,
	onUnauthorized?: () => void,
): WebSocketClient => {
	const isProd = window.location.hostname === "app.foxogram.su";
	const gatewayUrl = isProd
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
