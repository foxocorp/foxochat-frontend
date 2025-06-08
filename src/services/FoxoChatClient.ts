import { Client, RouteUrlsMap } from "foxochat.js";

const hostname = window.location.hostname;

const routeKey =
	hostname === "localhost" || hostname.endsWith("dev.foxochat.app")
		? "development"
		: "production";

const route = RouteUrlsMap[routeKey];

export const client = new Client({
	api: {
		rest: {
			baseURL: route.api,
		},
	},
	gateway: {
		url: route.gateway,
		reconnect: true,
		reconnectTimeout: 3000,
	},
});
