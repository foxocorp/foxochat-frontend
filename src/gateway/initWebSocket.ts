import { WebSocketClient } from "./webSocketClient";
import { GatewayCloseCodes } from "@foxogram/gateway-types";

export const initWebSocket = (
    token: string | null,
    onUnauthorized?: () => void,
): WebSocketClient => {
    const isProd = window.location.hostname === "foxogram.su";
    const gatewayUrl = isProd
        ? "wss://gateway.foxogram.su"
        : "wss://gateway.dev.foxogram.su";

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
