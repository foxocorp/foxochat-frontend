import { EventMap, Gateway } from "@interfaces/interfaces";
import { client } from "@services/FoxoChatClient";
import { LogLevel, Logger } from "@utils/logger";
import type { APIMessage, Client } from "foxochat.js";

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
		const gateway = this.client.gateway as Gateway;

		gateway.on("hello", () => {
			Logger.group("[CONNECTION] WebSocket connected", LogLevel.Info);
			Logger.info(`WebSocket connected successfully`);
			Logger.groupEnd();
			this.emit("connected", undefined);
		});

		gateway.on("closed", (code: number) => {
			Logger.error(`Connection closed: ${code}`);
			const closeEvent = new CloseEvent("close", { code });
			if (code === 4003) {
				Logger.warn(`Unauthorized — triggering onUnauthorized`);
				this.onUnauthorized?.();
			}
			this.onClose?.(closeEvent);
			this.emit("close", closeEvent);
		});

		gateway.on("socketError", (event: Event) => {
			Logger.error(`WebSocket error: ${event}`);
			this.emit("error", new Error(`WebSocket error: ${event}`));
		});

		gateway.on("dispatch", (message) => {
			if (!message?.t) return;

			Logger.info(`[GATEWAY EVENT] Received raw event type: "${message.t}"`);
			const eventType = message.t.toUpperCase();

			switch (eventType) {
				case "MESSAGE_CREATE":
					Logger.info(`[WebSocketClient] Matched MESSAGE_CREATE, emitting...`);
					this.emit("MESSAGE_CREATE", message.d as APIMessage);
					break;
				case "MESSAGE_DELETE":
					Logger.info(`[WebSocketClient] Matched MESSAGE_DELETE, emitting...`);
					this.emit(
						"MESSAGE_DELETE",
						message.d as { id: number; channel_id: number },
					);
					break;
				default:
					console.warn(`Unhandled gateway event: ${eventType}`);
			}
		});
	}

	public async connect(): Promise<void> {
		Logger.header(`NEW CONNECTION`);
		Logger.group(`WebSocket Session — ${client.gateway.options.url}`);
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
		const listeners = this.listeners[event];
		if (!listeners) {
			throw new Error(
				`Failed to initialize listeners for event: ${String(event)}`,
			);
		}
		return listeners;
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
			this.listeners[event] = list.filter((l) => l !== listener) as typeof list;
		}
	}

	private emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
		for (const listener of this.ensureListener(event)) {
			listener(data);
		}
	}
}
