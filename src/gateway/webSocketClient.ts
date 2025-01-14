import { GatewayOpcodes } from '@foxogram/gateway-types';
import { Logger } from '../utils/logger.ts'

export class WebSocketClient {
    private socket: WebSocket;
    private readonly token: () => (string | null);
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private heartbeatIntervalTime: number | null = null;

    constructor(token: () => (string | null), gatewayUrl: string) {
        this.token = token;
        this.socket = new WebSocket(gatewayUrl);

        this.socket.onopen = this.handleOpen;
        this.socket.onmessage = this.handleMessage;
        this.socket.onerror = this.handleError;
        this.socket.onclose = this.handleClose;
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
        Logger.log(`Received message: ${JSON.stringify(message)}`);

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
        Logger.info("Sending Heartbeat");
        this.send({
            op: GatewayOpcodes.Heartbeat,
            d: {},
        });
    };

    private handleHello = (data: any) => {
        Logger.info(`Received Hello message: ${JSON.stringify(data)}`);
        this.heartbeatIntervalTime = data.heartbeat_interval;
        if (this.heartbeatIntervalTime) {
            this.startHeartbeat(this.heartbeatIntervalTime);
        }
    };

    private startHeartbeat(interval: number) {
        Logger.info(`Starting heartbeat with interval ${interval} ms`);

        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, interval);
    }

    private handleHeartbeatAck = () => {
        Logger.info('Received HeartbeatAck');
    };

    private handleDispatch = (data: any) => {
        Logger.log(`Dispatch event data: ${JSON.stringify(data)}`);
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
}