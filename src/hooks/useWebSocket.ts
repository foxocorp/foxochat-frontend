import { useEffect, useState } from "preact/hooks";
import { initWebSocket } from "../gateway";
import { WebSocketClient } from "../gateway/webSocketClient";

export function useWebSocket(): WebSocketClient | null {
    const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);

    useEffect(() => {
        const client = initWebSocket();

        if (client) {
            setWsClient(client);
        } else {
            console.error("Failed to initialize WebSocket client");
        }

        return () => {
            if (client instanceof WebSocketClient) {
                client.close();
            }
        };
    }, []);

    return wsClient;
}