if (import.meta.env.MODE !== "production") {
    await import("preact/debug");
}

import "@fontsource/inter";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

import "./style.scss";
import "./scss/style.scss";

import { render, Component, ComponentChild, ErrorInfo } from "preact";
import { useState, useEffect } from "preact/hooks";
import { LocationProvider, Router, Route } from "preact-iso";
import { Workbox } from "workbox-window";

import { Home } from "./pages/Home";
import { NotFound } from "./pages/Fallbacks/NotFound/NotFound";
import { Maintenance } from "./pages/Fallbacks/Maintenance/Maintenance";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import EmailConfirmationHandler from "./pages/Auth/Email/Verify";
import Loading from "@components/LoadingApp/LoadingApp";

import { RouteConfig } from "@interfaces/interfaces";
import appStore from "@store/app";
import { Logger } from "@utils/logger";

import { useAuthStore } from "@store/authenticationStore";

const authStore = useAuthStore();

export const routes: RouteConfig[] = [
    { path: "/", component: Home },
    { path: "/auth/login", component: Login },
    { path: "/auth/register", component: Register },
    { path: "/auth/email/verify", component: EmailConfirmationHandler },
    { path: "*", component: NotFound },
];

async function registerServiceWorker() {
    if ("serviceWorker" in navigator && import.meta.env.MODE === "production") {
        try {
            const wb = new Workbox("/sw.js");
            wb.addEventListener("waiting", () => wb.messageSW({ type: "SKIP_WAITING" }));
            await wb.register();
            Logger.info("Service Worker registered successfully");
        } catch (error) {
            Logger.error("Failed to register Service Worker:", error);
        }
    }
}

class ErrorBoundary extends Component<{ children: ComponentChild }, { hasError: boolean }> {
    override state = { hasError: false };

    static override getDerivedStateFromError() {
        return { hasError: true };
    }

    override componentDidCatch(error: Error, info: ErrorInfo) {
        Logger.error("Uncaught error in app:", error, info);
    }

    render() {
        if (this.state.hasError) return <Maintenance />;
        return this.props.children;
    }
}

function InitializationCheck({ children }: { children: ComponentChild }) {
    const [status, setStatus] = useState<"loading" | "success" | "error" | "unauthorized">("loading");
    const isAuthenticated = authStore.isAuthenticated;

    useEffect(() => {
        if (!isAuthenticated) {
            setStatus("unauthorized");
            return;
        }

        async function init() {
            setStatus("loading");
            try {
                await appStore.initializeStore();
                setStatus("success");
            } catch (error) {
                Logger.error("Initialization failed:", error);
                setStatus(
                    appStore.currentUserId && !appStore.connectionError?.includes("WebSocket")
                        ? "success"
                        : "error",
                );
            }
        }

        void init();
    }, [isAuthenticated]);

    if (status === "loading") return <Loading isLoading onLoaded={() => undefined} />;
    if (status === "unauthorized") return <>{children}</>;
    if (status === "error" || (appStore.connectionError && !appStore.currentUserId)) return <Maintenance />;
    return <>{children}</>;
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
    }, []);

    return (
        <ErrorBoundary>
            <LocationProvider>
                <InitializationCheck>
                    <main>
                        <Routes />
                    </main>
                </InitializationCheck>
            </LocationProvider>
        </ErrorBoundary>
    );
}

const appContainer = document.getElementById("app");
if (!appContainer) throw new Error("Container #app not found");
render(<App />, appContainer);