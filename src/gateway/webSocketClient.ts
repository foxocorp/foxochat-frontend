import {
    GatewayOpcodes,
    GatewayDispatchEvents,
    GatewayDispatchMessageCreateMessage,
    GatewayDispatchMessageUpdateMessage,
    GatewayDispatchMessageDeleteMessage,
} from "@foxogram/gateway-types";
import { Logger } from "../utils/logger.ts";
import { APIMessage } from "@foxogram/api-types";

interface GatewayMessage {
    op: GatewayOpcodes;
    d?: unknown;
    s?: number;
    t?: string;
}

export class WebSocketClient {
    private socket: WebSocket;
    private readonly token: () => string | null;
    private heartbeatIntervalId: ReturnType<typeof setInterval> | null = null;
    private eventListeners: Record<string, EventListener[]> = {};

    constructor(token: () => string | null, gatewayUrl: string) {
        this.token = token;
        this.socket = new WebSocket(gatewayUrl);
        this.setupWebSocketHandlers();
    }

    private setupWebSocketHandlers() {
        this.socket.onopen = this.handleOpen;
        this.socket.onmessage = this.handleMessage;
        this.socket.onclose = this.handleClose;
    }

    private handleOpen = () => {
        const token = this.token();
        Logger.info(`WebSocket connected to ${this.socket.url}`);
        if (token) {
            this.send({ op: GatewayOpcodes.Identify, d: { token } });
        } else {
            Logger.error("No token provided for authentication.");
        }
    };

    private handleMessage = ({ data }: MessageEvent) => {
        try {
            const message = this.safeParse(data as string) as GatewayMessage;
            console.log("Received message:", message);

            switch (message.op) {
                case GatewayOpcodes.Dispatch:
                    this.handleDispatch(message as GatewayDispatchMessageCreateMessage | GatewayDispatchMessageUpdateMessage | GatewayDispatchMessageDeleteMessage);
                    break;
                case GatewayOpcodes.Hello:
                    this.startHeartbeat((message.d as { heartbeat_interval: number }).heartbeat_interval);
                    break;
                case GatewayOpcodes.HeartbeatAck:
                    Logger.debug("Received HeartbeatAck");
                    break;
                default:
                    Logger.warn(`Unhandled opcode: ${message.op}`);
            }
        } catch (error) {
            Logger.error((error instanceof Error ? error.message : "An unknown error occurred"));
        }
    };

    private safeParse(data: string): unknown {
        try {
            return JSON.parse(data);
        } catch (error) {
            Logger.error((error instanceof Error ? error.message : "An unknown error occurred"));
            throw new Error("Invalid JSON data");
        }
    }

    private handleDispatch(message: GatewayDispatchMessageCreateMessage | GatewayDispatchMessageUpdateMessage | GatewayDispatchMessageDeleteMessage) {
        if ("t" in message) {
            switch (message.t) {
                case GatewayDispatchEvents.MessageCreate:
                    this.emit("MESSAGE_CREATE", message.d);
                    break;
                case GatewayDispatchEvents.MessageUpdate:
                    this.emit("MESSAGE_UPDATE", message.d);
                    break;
                case GatewayDispatchEvents.MessageDelete:
                    this.emit("MESSAGE_DELETE", message.d);
                    break;
                default:
                    Logger.warn(`Unhandled event: ${message.t}`);
            }
        } else {
            Logger.warn("Received message does not have event type (t)");
        }
    }

    private handleClose = ({ code }: CloseEvent) => {
        Logger.warn(`WebSocket closed with code ${code}`);
        if (code !== 1000) this.reconnect();
    };

    private startHeartbeat(interval: number) {
        if (this.heartbeatIntervalId) clearInterval(this.heartbeatIntervalId);
        this.heartbeatIntervalId = setInterval(() => {
            this.send({ op: GatewayOpcodes.Heartbeat, d: {} });
        }, interval);
    }

    private reconnect = () => {
        Logger.info("Reconnecting WebSocket...");
        this.socket = new WebSocket(this.socket.url);
        this.setupWebSocketHandlers();
    };

    private send(message: GatewayMessage) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            Logger.warn("WebSocket is not open");
        }
    }

    private emit(event: string, data: unknown): void {
        const listeners = this.eventListeners[event] ?? [];
        listeners.forEach((listener) => { listener(data); });
    }


    public on(event: string, listener: (newMessage: APIMessage) => void) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(listener);
    }

    public off(event: string, listener: (newMessage: APIMessage) => void) {
        const listeners = this.eventListeners[event];
        if (!listeners) return;
        this.eventListeners[event] = listeners.filter((l) => l !== listener);
    }

}
