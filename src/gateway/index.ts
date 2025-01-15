import { WebSocketClient } from './webSocketClient.ts';
import { getAuthToken } from '../services/api/apiMethods.ts';

export const initWebSocket = () => {
    const token = getAuthToken();

    if (token) {
        const gatewayUrl = import.meta.env.PROD
            ? "wss://gateway.foxogram.su"
            : "wss://gateway.dev.foxogram.su";

        return new WebSocketClient(() => token, gatewayUrl);
    } else {
        console.log("Token is not available");
        return null;
    }
};