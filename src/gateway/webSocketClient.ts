import { LogLevel, Logger } from "@utils/logger";
import type { Client } from "foxogram.js";
import { GatewayDispatchEvents } from "foxogram.js";

interface EventMap {
	connected: undefined;
	error: Error;
	close: CloseEvent;
	MESSAGE_CREATE: any;
	MESSAGE_DELETE: any;
}

export class WebSocketClient {
	public readonly client: Client;

	private readonly listeners: {
		[K in keyof EventMap]?: ((data: EventMap[K]) => void)[];
	} = {};

	constructor(
		client: Client,
		private readonly getToken: () => string | null,
		private readonly onClose?: (evt: CloseEvent) => void,
		private readonly onUnauthorized?: () => void,
	) {
		if (typeof window === "undefined") {
			throw new Error(
				"WebSocketClient can only be used in a browser environment",
			);
		}
		this.client = client;
		this.setupEventHandlers();
	}

	private setupEventHandlers(): void {
		this.client.on("ready", () => {
			Logger.group("[CONNECTION] WebSocket connected", LogLevel.Info);
			Logger.info(`WebSocket connected successfully`);
			Logger.groupEnd();
			this.emit("connected", undefined);
		});

		this.client.on("closed", (code: number) => {
			Logger.error(`Connection closed: ${code}`);
			const closeEvent = new CloseEvent("close", { code });
			if (code === 4003) {
				Logger.warn(`Unauthorized — triggering onUnauthorized`);
				this.onUnauthorized?.();
			}
			this.onClose?.(closeEvent);
			this.emit("close", closeEvent);
		});

		this.client.on("socketError", (error: Error) => {
			Logger.error(`WebSocket error: ${error.message}`);
			this.emit("error", error);
		});

		this.client.on("dispatch", (event: { t: string; d: any }) => {
			Logger.info(`[GATEWAY EVENT] ${event.t}`);
			Logger.info(`Event data: ${JSON.stringify(event.d)}`);
			const eventType = event.t as GatewayDispatchEvents;
			switch (eventType) {
				case GatewayDispatchEvents.MessageCreate:
					this.emit("MESSAGE_CREATE", event.d);
					break;
				case GatewayDispatchEvents.MessageDelete:
					this.emit("MESSAGE_DELETE", event.d);
					break;
				default:
					console.warn(`Unhandled gateway event: ${event.t}`);
			}
		});
	}

	public async connect(): Promise<void> {
		Logger.header(`NEW CONNECTION`);
		Logger.group(`WebSocket Session — ${this.client.gateway.url}`);
		Logger.info(`[WS] Attempting connect`);

		const token = this.getToken();
		if (!token) {
			Logger.error(`No token provided`);
			Logger.groupEnd();
			throw new Error(`No token provided`);
		}

		const start = performance.now();

		try {
			await this.client.login(token);
			const duration = performance.now() - start;
			Logger.info(`[FAST CONNECT] connected in ${duration.toFixed(2)}ms`);
		} catch (err: unknown) {
			Logger.error(
				`Failed to login: ${err instanceof Error ? err.message : String(err)}`,
			);
			Logger.groupEnd();
			this.onUnauthorized?.();
			throw err;
		} finally {
			Logger.groupEnd();
		}
	}

	private ensureListener<K extends keyof EventMap>(
		event: K,
	): ((data: EventMap[K]) => void)[] {
		if (!this.listeners[event]) {
			this.listeners[event] = [];
		}
		return this.listeners[event]!;
	}

	public on<K extends keyof EventMap>(
		event: K,
		listener: (data: EventMap[K]) => void,
	): void {
		this.ensureListener(event).push(listener);
	}

	public off<K extends keyof EventMap>(
		event: K,
		listener: (data: EventMap[K]) => void,
	): void {
		const list = this.listeners[event];
		if (list) {
			this.listeners[event] = list.filter((l) => l !== listener);
		}
	}

	private emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
		for (const listener of this.ensureListener(event)) {
			listener(data);
		}
	}
}
