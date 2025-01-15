import { GatewayDispatchEvents, GatewayOpcodes } from "@foxogram/gateway-types";
import { Logger } from '../utils/logger.ts';

export class WebSocketClient {
    private socket: WebSocket;
    private readonly token: () => (string | null);
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private heartbeatIntervalTime: number | null = null;
    private messages: any[] = [];
    private eventListeners: { [event: string]: Function[] } = {};

    constructor(token: () => (string | null), gatewayUrl: string) {
        this.token = token;
        this.socket = new WebSocket(gatewayUrl);

        this.socket.onopen = this.handleOpen;
        this.socket.onmessage = this.handleMessage;
        this.socket.onerror = this.handleError;
        this.socket.onclose = this.handleClose;
    }

    public on(event: string, listener: Function) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(listener);
    }

    public off(event: string, listener: Function) {
        const listeners = this.eventListeners[event];
        if (!listeners) return;

        this.eventListeners[event] = listeners.filter(l => l !== listener);
    }

    private emit(event: string, data: any) {
        const listeners = this.eventListeners[event];
        if (listeners) {
            listeners.forEach(listener => listener(data));
        }
    }

    private handleOpen = () => {
        const token = this.token();
        Logger.info(`WebSocket connected to ${this.socket.url}`);
        this.send({
            op: GatewayOpcodes.Identify,
            d: { token },
        });
    };

    private handleMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        Logger.debug(`Received message: ${JSON.stringify(message)}`);

        switch (message.op) {
            case GatewayOpcodes.Heartbeat:
                this.sendHeartbeat();
                break;
            case GatewayOpcodes.Hello:
                this.handleHello(message.d);
                break;
            case GatewayOpcodes.HeartbeatAck:
                this.handleHeartbeatAck();
                break;
            case GatewayOpcodes.Dispatch:
                this.handleDispatch(message.d);
                break;
            default:
                Logger.warn(`Unhandled op: ${message.op}`);
        }
    };

    private sendHeartbeat = () => {
        Logger.debug("Sending Heartbeat");
        this.send({
            op: GatewayOpcodes.Heartbeat,
            d: {},
        });
    };

    private handleHello = (data: any) => {
        Logger.debug(`Received Hello message: ${JSON.stringify(data)}`);
        this.heartbeatIntervalTime = data.heartbeat_interval;
        if (this.heartbeatIntervalTime) {
            this.startHeartbeat(this.heartbeatIntervalTime);
        }
    };

    private startHeartbeat(interval: number) {
        Logger.debug(`Starting heartbeat with interval ${interval} ms`);

        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, interval);
    }

    private handleHeartbeatAck = () => {
        Logger.debug('Received HeartbeatAck');
    };

    private handleDispatch = (data: any) => {
        Logger.debug(`Dispatch event data: ${JSON.stringify(data)}`);

        switch (data.event) {
            case GatewayDispatchEvents.MessageCreate:
                this.handleMessageCreate(data);
                break;
            case GatewayDispatchEvents.MessageDelete:
                this.handleMessageDelete(data);
                break;
            case GatewayDispatchEvents.MessageUpdate:
                this.handleMessageUpdate(data);
                break;
            default:
                Logger.warn(`Unhandled dispatch event: ${data.event}`);
        }
    };

    private handleMessageCreate = (data: any) => {
        Logger.info(`Message created: ${JSON.stringify(data)}`);

        const newMessage = {
            id: data.payload.id,
            content: data.payload.content,
            author: data.payload.author,
            channel: data.payload.channel,
            attachments: data.payload.attachments,
            createdAt: data.payload.createdAt,
        };
        this.messages.push(newMessage);
        Logger.debug(`Message added to chat: ${JSON.stringify(newMessage)}`);

        this.emit("messageCreate", newMessage);
    };

    private handleMessageDelete = (data: any) => {
        Logger.debug(`Message deleted: ${JSON.stringify(data)}`);

        this.messages = this.messages.filter(msg => msg.id !== data.payload.id);
        Logger.debug(`Message deleted from chat: ${data.payload.id}`);

        this.emit("messageDelete", data.payload.id);
    };

    private handleMessageUpdate = (data: any) => {
        Logger.debug(`Message updated: ${JSON.stringify(data)}`);

        const updatedMessage = this.messages.find(msg => msg.id === data.payload.id);
        if (updatedMessage) {
            updatedMessage.content = data.payload.content;
            Logger.debug(`Message updated in chat: ${JSON.stringify(updatedMessage)}`);

            this.emit("messageUpdate", updatedMessage);
        }
    };

    private handleError = (error: Event) => {
        Logger.error(`WebSocket error: ${JSON.stringify(error)}`);
    };

    private handleClose = (event: CloseEvent) => {
        Logger.warn(`WebSocket closed: ${JSON.stringify(event)}`);
        this.reconnect();
    };

    private reconnect = () => {
        Logger.info('WebSocket reconnecting...');
        setTimeout(() => {
            this.socket = new WebSocket(this.socket.url);
            this.socket.onopen = this.handleOpen;
            this.socket.onmessage = this.handleMessage;
            this.socket.onerror = this.handleError;
            this.socket.onclose = this.handleClose;
        }, 3000);
    };

    private send(message: { op: GatewayOpcodes; d: any }) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            Logger.warn('WebSocket is not open');
        }
    }

    public sendMessage(content: { content: string; attachments: string[] }) {
        this.send({
            op: GatewayOpcodes.Dispatch,
            d: {
                event: GatewayDispatchEvents.MessageCreate,
                payload: content,
            },
        });

        Logger.info(`Sent message: ${JSON.stringify(content)}`);
    }
}