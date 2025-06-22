import "./scss/style.scss";
import "preact/debug";
import { Component, ComponentChild, ErrorInfo, render } from "preact";
import { LocationProvider, Route, Router, useLocation } from "preact-iso";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { Workbox } from "workbox-window";

import Loading from "@components/LoadingApp/LoadingApp";
import EmailConfirmationHandler from "./pages/Auth/Email/Verify";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import { Maintenance } from "./pages/Fallbacks/Maintenance/Maintenance";
import { NotFound } from "./pages/Fallbacks/NotFound/NotFound";
import { Home } from "./pages/Home";
import Landing from "./pages/Landing";
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

const ProtectedRoute = ({
	component: Component,
}: { component: preact.AnyComponent }) => {
	const auth = useAuthStore();
	const location = useLocation();

	useEffect(() => {
		if (!auth.isAuthenticated) {
			location.route("/login", true);
		}
	}, [auth.isAuthenticated, location]);

	return auth.isAuthenticated ? <Component /> : null;
};

export const routes: RouteConfig[] = [
	{ path: "/", component: Landing },
	{ path: "/login", component: Login },
	{ path: "/register", component: Register },
	{ path: "/email/verify", component: EmailConfirmationHandler },
	{ path: "/privacy", component: Privacy },
	{ path: "/terms", component: Terms },
	{
		path: "/channels",
		component: () => <ProtectedRoute component={Home} />,
	},
	{ path: "*", component: NotFound },
];

const initializeEmojiSupport = () => {
	const html = document.documentElement;
	if (isAppleDevice()) {
		html.classList.add("is-apple", "native-emoji");
	} else {
		html.classList.add("custom-emoji");
	}
};

const registerServiceWorker = async () => {
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
};

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

enum AppStatus {
	Loading = "loading",
	Success = "success",
	Error = "error",
	Unauthorized = "unauthorized",
	NotInApp = "not_in_app",
}

const useAppInitialization = () => {
	const [status, setStatus] = useState<AppStatus>(AppStatus.Loading);
	const [isLoading, setIsLoading] = useState(false);
	const isAuthenticated = authStore.isAuthenticated;
	const location = useLocation();

	const isChannelsPage = useMemo(() => 
		location.path.startsWith("/channels"), 
		[location.path]
	);

	const shouldShowLoading = useMemo(() => 
		isLoading || status === AppStatus.Loading, 
		[isLoading, status]
	);

	const initializeApp = useCallback(async () => {
		if (location.path === "/") {
			setStatus(AppStatus.NotInApp);
			appStore.resetStore();
			return;
		}

		if (!isAuthenticated && location.path !== "/") {
			setIsLoading(true);
			await new Promise((resolve) => setTimeout(resolve, 300));
			setStatus(AppStatus.Unauthorized);
			setIsLoading(false);
			return;
		}

		if (isAuthenticated && isChannelsPage) {
			if (appStore.isWsInitialized && appStore.channels.length > 0) {
				setStatus(AppStatus.Success);
				return;
			}

			setIsLoading(true);
			await new Promise((resolve) => setTimeout(resolve, 300));
			setStatus(AppStatus.Loading);
			
			try {
				await appStore.initializeStore();
				setStatus(AppStatus.Success);
			} catch (error: unknown) {
				setStatus(
					appStore.currentUserId &&
						!appStore.connectionError?.includes("WebSocket")
						? AppStatus.Success
						: AppStatus.Error,
				);
			}
			setIsLoading(false);
		} else if (isAuthenticated) {
			setStatus(AppStatus.NotInApp);
			appStore.resetStore();
		}
	}, [isAuthenticated, location.path, isChannelsPage]);

	useEffect(() => {
		void initializeApp();
	}, [initializeApp]);

	useEffect(() => {
		return () => {
			appStore.resetStore();
		};
	}, []);

	return {
		status,
		shouldShowLoading,
	};
};

const InitializationCheck = ({ children }: { children: ComponentChild }) => {
	const { status, shouldShowLoading } = useAppInitialization();

	if (shouldShowLoading) {
		return <Loading isLoading onLoaded={() => undefined} />;
	}

	if (status === AppStatus.Unauthorized || status === AppStatus.NotInApp) {
		return children;
	}

	if (status === AppStatus.Error && appStore.connectionError && !appStore.currentUserId) {
		return <Maintenance />;
	}

	return children;
};

const Routes = () => (
	<Router>
		{routes.map(({ path, component }) => (
			<Route key={path} path={path} component={component} />
		))}
	</Router>
);

const useKeyboardHandlers = () => {
	useEffect(() => {
		const handleTab = (e: KeyboardEvent) => {
			if (e.key === "Tab") {
				e.preventDefault();
			}
		};

		window.addEventListener("keydown", handleTab, { capture: true });
		return () => {
			window.removeEventListener("keydown", handleTab, { capture: true });
		};
	}, []);
};

export const App = () => {
	useKeyboardHandlers();

	useEffect(() => {
		initializeEmojiSupport();
		void registerServiceWorker();
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
};

document.addEventListener("DOMContentLoaded", initializeEmojiSupport);

const appContainer = document.getElementById("app");
if (!appContainer) throw new Error("Container #app not found");
render(<App />, appContainer);
