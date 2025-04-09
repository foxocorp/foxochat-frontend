import { Logger } from "@utils/logger.ts";
import type { ConnectionManager } from "@interfaces/interfaces.d.ts";

export const connectionManager: ConnectionManager = {
    startHeartbeat(interval, sendHeartbeat, onMissed) {
        sendHeartbeat();
        return setInterval(() => {
            sendHeartbeat();
            onMissed();
        }, interval);
    },
    cleanupHeartbeat(heartbeatIntervalId) {
        if (heartbeatIntervalId !== null) {
            clearInterval(heartbeatIntervalId);
        }
    },
    scheduleReconnect(isExplicitClose, currentAttempts, maxReconnectAttempts, currentDelay, reconnectFn) {
        if (isExplicitClose || currentAttempts >= maxReconnectAttempts) return null;
        return setTimeout(() => {
            reconnectFn();
        }, currentDelay);
    },
    checkConnectionHealth(isConnected, heartbeatAckReceived, reconnectFn, delay) {
        if (!isConnected || !heartbeatAckReceived) {
            Logger.warn("Connection unhealthy, forcing reconnect");
            setTimeout(() => {
                reconnectFn();
            }, delay);
        }
    },
};
