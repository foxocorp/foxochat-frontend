import "./scss/style.scss";
import "preact/debug";
import { Component, ComponentChild, ErrorInfo, render } from "preact";
import { LocationProvider, Route, Router } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import { Workbox } from "workbox-window";

import Loading from "@components/LoadingApp/LoadingApp";
import EmailConfirmationHandler from "./pages/Auth/Email/Verify";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import { Maintenance } from "./pages/Fallbacks/Maintenance/Maintenance";
import { NotFound } from "./pages/Fallbacks/NotFound/NotFound";
import { Home } from "./pages/Home";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

import {
	ErrorBoundaryProps,
	ErrorBoundaryState,
	RouteConfig,
} from "@interfaces/interfaces";
import appStore from "@store/app";
import { Logger } from "@utils/logger";

import { useAuthStore } from "@store/authenticationStore";
import { isAppleDevice } from "@utils/emoji";

const authStore = useAuthStore();

export const routes: RouteConfig[] = [
	{ path: "/", component: Home },
	{ path: "/auth/login", component: Login },
	{ path: "/auth/register", component: Register },
	{ path: "/auth/email/verify", component: EmailConfirmationHandler },
	{ path: "/privacy", component: Privacy },
	{ path: "/terms", component: Terms },
	{ path: "*", component: NotFound },
];

document.addEventListener("DOMContentLoaded", () => {
	const html = document.documentElement;
	if (isAppleDevice()) {
		html.classList.add("is-apple", "native-emoji");
	} else {
		html.classList.add("custom-emoji");
	}
});

async function registerServiceWorker() {
	if ("serviceWorker" in navigator && import.meta.env.MODE === "production") {
		try {
			const wb = new Workbox("/sw.js");
			wb.addEventListener("waiting", () =>
				wb.messageSW({ type: "SKIP_WAITING" }),
			);
			await wb.register();
			Logger.info("Service Worker registered successfully");
		} catch (error: unknown) {
			Logger.error(`Failed to register Service Worker: ${error}`);
		}
	}
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	override state: ErrorBoundaryState = { hasError: false };

	static override getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true };
	}

	override componentDidCatch(error: Error, info: ErrorInfo) {
		Logger.error(`Uncaught error in app: ${error}, ${info}`);
	}

	override render() {
		if (this.state.hasError) return <Maintenance />;
		return this.props.children;
	}
}

enum InitializationStatus {
	Loading = "loading",
	Success = "success",
	Error = "error",
	Unauthorized = "unauthorized",
}

function InitializationCheck({ children }: { children: ComponentChild }) {
	const [status, setStatus] = useState<InitializationStatus>(
		InitializationStatus.Loading,
	);
	const isAuthenticated = authStore.isAuthenticated;

	useEffect(() => {
		if (!isAuthenticated) {
			setStatus(InitializationStatus.Unauthorized);
			return;
		}

		async function init() {
			setStatus(InitializationStatus.Loading);
			try {
				await appStore.initializeStore();
				setStatus(InitializationStatus.Success);
			} catch (error: unknown) {
				Logger.error(`Initialization failed: ${error}`);
				setStatus(
					appStore.currentUserId &&
						!appStore.connectionError?.includes("WebSocket")
						? InitializationStatus.Success
						: InitializationStatus.Error,
				);
			}
		}

		void init();
	}, [isAuthenticated]);

	switch (status) {
		case InitializationStatus.Loading:
			return <Loading isLoading onLoaded={() => undefined} />;
		case InitializationStatus.Unauthorized:
			return children;
		case InitializationStatus.Error:
			if (appStore.connectionError && !appStore.currentUserId) {
				return <Maintenance />;
			}
			return children;
		case InitializationStatus.Success:
		default:
			return children;
	}
}

function Routes() {
	return (
		<Router>
			{routes.map(({ path, component }) => (
				<Route key={path} path={path} component={component} />
			))}
		</Router>
	);
}

export function App() {
	useEffect(() => {
		void registerServiceWorker();

		const handleTab = (e: KeyboardEvent) => {
			if (e.key === "Tab") {
				e.preventDefault();
			}
		};
		window.addEventListener("keydown", handleTab, { capture: true });
		return () => window.removeEventListener("keydown", handleTab, {
			capture: true,
		});
	}, []);

	return (
		<ErrorBoundary>
			<LocationProvider>
				<InitializationCheck>
					<Routes />
				</InitializationCheck>
			</LocationProvider>
		</ErrorBoundary>
	);
}

const appContainer = document.getElementById("app");
if (!appContainer) throw new Error("Container #app not found");
render(<App />, appContainer);
