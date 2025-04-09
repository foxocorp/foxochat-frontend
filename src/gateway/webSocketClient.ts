import {
    GatewayOpcodes,
    GatewayDispatchEvents, GatewayCloseCodes,
} from "@foxogram/gateway-types";
import { Logger } from "@utils/logger.ts";
import { APIChannel, APIMember, APIMessage } from "@foxogram/api-types";

interface GatewayMessage {
    op: GatewayOpcodes;
    d?: unknown;
    s?: number;
    t?: string;
}

type EventListener<T> = (data: T) => void;

interface EventMap {
    [GatewayDispatchEvents.MessageCreate]: APIMessage;
    [GatewayDispatchEvents.MessageUpdate]: APIMessage;
    [GatewayDispatchEvents.MessageDelete]: { id: number };
    [GatewayDispatchEvents.ChannelCreate]: APIChannel;
    [GatewayDispatchEvents.ChannelUpdate]: APIChannel;
    [GatewayDispatchEvents.ChannelDelete]: { id: number };
    [GatewayDispatchEvents.MemberAdd]: APIMember;
    [GatewayDispatchEvents.MemberRemove]: { user_id: number; channel_id: number };
    [GatewayDispatchEvents.MemberUpdate]: APIMember;
    connected: void;
    close: CloseEvent;
    error: Event;
}

export class WebSocketClient {
    private socket: WebSocket | null = null;
    private readonly getToken: () => string | null;
    private heartbeatIntervalId: ReturnType<typeof setInterval> | null = null;
    private eventListeners: Partial<Record<keyof EventMap, EventListener<unknown>[]>> = {};
    private messageQueue: GatewayMessage[] = [];
    private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
    private heartbeatAckReceived = true;
    private readonly onUnauthorized?: () => void;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 3;
    private readonly gatewayUrl: string;
    public isConnected = false;
    private initialReconnectDelay = 5000;
    private isExplicitClose = false;
    private reconnectDelay = 1000;

    constructor(
        getToken: () => string | null,
        gatewayUrl: string,
        onClose?: (event: CloseEvent) => void,
        onUnauthorized?: () => void,
    ) {
        this.getToken = getToken;
        this.gatewayUrl = gatewayUrl;
        this.onClose = onClose;
        this.onUnauthorized = onUnauthorized;
    }

    public connect() {
        if (this.isExplicitClose) return;

        if (!this.getToken()) {
            Logger.error("Cannot connect: No authentication token");
            this.onUnauthorized?.();
            return;
        }

        try {
            if (this.socket) {
                this.socket.close();
                this.socket = null;
            }

            this.socket = new WebSocket(this.gatewayUrl);

            const connectTimeout = setTimeout(() => {
                if (this.socket?.readyState !== WebSocket.OPEN) {
                    Logger.error("Connection timeout");
                    this.socket?.close();
                }
            }, 5000);

            this.socket.onopen = () => {
                clearTimeout(connectTimeout);
                this.handleOpen();
            };

            this.setupWebSocketHandlers();
        } catch (error) {
            console.error("WebSocket connection error:", error);
            this.scheduleReconnect();
        }
    }

    private setupWebSocketHandlers() {
        if (!this.socket) return;

        this.socket.onopen = this.handleOpen;
        this.socket.onmessage = (e: MessageEvent) => this.handleMessage(e);
        this.socket.onclose = (e: CloseEvent) => this.handleClose(e);
        this.socket.onerror = (e: Event) => {
            Logger.error(`WebSocket error: ${e}`);
            this.handleError(e);
        };
    }

    private handleError = (e: Event) => {
        Logger.error("WebSocket connection error");
        this.emit("error", e);
        this.scheduleReconnect();
    };

    private handleOpen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        Logger.debug("WebSocket connection established");
        this.sendIdentify();
        this.emit("connected", undefined);
    };

    private sendIdentify() {
        const token = this.getToken();
        if (!token) {
            Logger.error("No token available for identification");
            this.socket?.close();
            return;
        }

        const payload: { token: string; intents: number } = {
            token,
            intents: (1 << 0) | (1 << 1) | (1 << 2),
        };
        this.send({ op: GatewayOpcodes.Identify, d: payload });
    }

    private handleMessage = ({ data }: MessageEvent) => {
        if (typeof data !== "string") {
            Logger.warn("Received non-text message");
            return;
        }

        try {
            const message = this.parseMessage(data);
            this.processGatewayMessage(message);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            Logger.error(`Message handling failed: ${errorMessage}`);
        }
    };

    private parseMessage(data: string): GatewayMessage {
        try {
            const parsed: unknown = JSON.parse(data);
            if (this.isGatewayMessage(parsed)) {
                return parsed;
            }
            throw new Error("Invalid message structure");
        } catch (error) {
            throw new Error("Malformed JSON received");
        }
    }

    private isGatewayMessage(msg: unknown): msg is GatewayMessage {
        return typeof msg === "object" &&
            msg !== null &&
            "op" in msg &&
            Object.values(GatewayOpcodes).includes(Number((msg as GatewayMessage).op));
    }

    private processGatewayMessage(message: GatewayMessage) {
        const opcode = message.op;
        switch (opcode) {
            case GatewayOpcodes.Dispatch:
                this.handleDispatch(message);
                break;

            case GatewayOpcodes.Hello:
                this.handleHello(message.d as { heartbeat_interval: number });
                break;

            case GatewayOpcodes.HeartbeatAck:
                this.handleHeartbeatAck();
                break;

            case GatewayOpcodes.Heartbeat:
                this.handleServerHeartbeat();
                break;

            default:
                Logger.warn(`Unhandled opcode: ${GatewayOpcodes[opcode] || opcode}`);
        }
    }

    private handleHello(helloData: { heartbeat_interval: number }) {
        Logger.debug("Received Hello, starting heartbeat...");
        this.startHeartbeat(helloData.heartbeat_interval);
    }

    private startHeartbeat(interval: number) {
        this.cleanupHeartbeat();

        this.sendHeartbeat();

        this.heartbeatIntervalId = setInterval(() => {
            if (!this.heartbeatAckReceived) {
                Logger.warn("Missed heartbeat ACK, reconnecting...");
                this.reconnect();
                return;
            }

            this.heartbeatAckReceived = false;
            this.sendHeartbeat();
        }, interval);
    }

    private handleHeartbeatAck() {
        this.heartbeatAckReceived = true;
        Logger.debug("Heartbeat acknowledged");

        setTimeout(() => this.checkConnectionHealth(), this.heartbeatInterval * 0.9);
    }

    private handleServerHeartbeat() {
        Logger.debug("Server requested heartbeat");
        this.sendHeartbeat();
    }

    private handleDispatch(message: GatewayMessage) {
        if (!message.t) {
            Logger.warn("Received dispatch without event type");
            return;
        }

        this.processEvent(message.t as GatewayDispatchEvents, message.d);
    }

    private processEvent(eventType: GatewayDispatchEvents, data: unknown) {
        switch (eventType) {
            case GatewayDispatchEvents.MessageCreate:
                this.emit(GatewayDispatchEvents.MessageCreate, data as APIMessage);
                break;
            case GatewayDispatchEvents.MessageUpdate:
                this.emit(GatewayDispatchEvents.MessageUpdate, data as APIMessage);
                break;
            case GatewayDispatchEvents.MessageDelete:
                this.emit(GatewayDispatchEvents.MessageDelete, data as { id: number });
                break;
            case GatewayDispatchEvents.ChannelCreate:
                this.emit(GatewayDispatchEvents.ChannelCreate, data as APIChannel);
                break;
            case GatewayDispatchEvents.ChannelUpdate:
                this.emit(GatewayDispatchEvents.ChannelUpdate, data as APIChannel);
                break;
            case GatewayDispatchEvents.ChannelDelete:
                this.emit(GatewayDispatchEvents.ChannelDelete, data as { id: number });
                break;
            case GatewayDispatchEvents.MemberAdd:
                this.emit(GatewayDispatchEvents.MemberAdd, data as APIMember);
                break;
            case GatewayDispatchEvents.MemberRemove:
                this.emit(
                    GatewayDispatchEvents.MemberRemove,
                    data as { user_id: number; channel_id: number },
                );
                break;
            case GatewayDispatchEvents.MemberUpdate:
                this.emit(GatewayDispatchEvents.MemberUpdate, data as APIMember);
                break;
            default:
                Logger.warn(`Unhandled event type: ${eventType}`);
        }
    }

    private sendHeartbeat() {
        this.send({
            op: GatewayOpcodes.Heartbeat,
            d: null,
        });
    }

    private handleClose = (event: CloseEvent) => {
        Logger.error(`Connection closed: ${event.code} (${event.reason})`);
        this.isConnected = false;
        this.cleanupHeartbeat();

        if (this.onClose) {
            this.onClose(event);
        }

        if (event.code === GatewayCloseCodes.Unauthorized) {
            this.onUnauthorized?.();
            return;
        }

        if (!event.wasClean) {
            this.scheduleReconnect();
        }
    };

    private cleanupHeartbeat() {
        if (this.heartbeatIntervalId) {
            clearInterval(this.heartbeatIntervalId);
            this.heartbeatIntervalId = null;
        }
    }

    private checkConnectionHealth() {
        if (!this.isConnected || !this.heartbeatAckReceived) {
            Logger.warn("Connection unhealthy, forcing reconnect");
            this.reconnect();
        }
    }

    private scheduleReconnect() {
        if (this.isExplicitClose || this.reconnectAttempts >= this.maxReconnectAttempts) return;

        this.reconnectTimeoutId = setTimeout(() => {
            this.reconnectAttempts++;
            this.reconnectDelay *= 2;
            this.connect();
        }, this.reconnectDelay);
    }

    reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            Logger.error("Max reconnect attempts reached");
            this.onUnauthorized?.();
            return;
        }

        this.reconnectAttempts++;
        Logger.debug(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.heartbeatAckReceived = true;
        this.connect();
    }


    private send(message: GatewayMessage) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            this.messageQueue.push(message);
        }
    }

    private emit<T extends keyof EventMap>(event: T, data: EventMap[T]) {
        const listeners = this.eventListeners[event] ?? [];
        listeners.forEach(listener => { listener(data); });
    }

    public on<T extends keyof EventMap>(event: T, listener: EventListener<EventMap[T]>) {
        const listeners = this.eventListeners[event] ?? [];
        this.eventListeners[event] = [...listeners, listener as EventListener<unknown>];
    }

    public off<T extends keyof EventMap>(event: T, listener: EventListener<EventMap[T]>) {
        const listeners = this.eventListeners[event];
        if (listeners) {
            this.eventListeners[event] = listeners.filter(l => l !== listener);
        }
    }

    public getConnectionState() {
        return this.socket?.readyState;
    }

    public close() {
        this.isExplicitClose = true;
        this.reconnectDelay = 1000;
        Logger.info("Closing WebSocket connection...");
        this.reconnectAttempts = 0;
        this.isConnected = false;
        this.socket?.close(1000, "Client initiated closure");
        this.cleanupHeartbeat();
        this.messageQueue = [];
    }
}