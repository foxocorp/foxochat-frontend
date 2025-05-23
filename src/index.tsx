if (import.meta.env.MODE !== "production") {
    await import("preact/debug");
}

import "@fontsource/inter";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./style.scss";
import "./scss/style.scss";

import { render, Component, ComponentChild } from "preact";
import { useState, useEffect, useMemo } from "preact/hooks";
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
            wb.addEventListener("waiting", async () => {
                await wb.messageSW({ type: "SKIP_WAITING" });
            });
            await wb.register();
            Logger.info("Service Worker registered successfully");
        } catch (error) {
            Logger.error("Failed to register Service Worker:", error);
        }
    }
}

class ErrorBoundary extends Component<{ children: ComponentChild }> {
    override state = { hasError: false };

    static override getDerivedStateFromError() {
        return { hasError: true };
    }

    override componentDidCatch(error: Error) {
        Logger.error("Uncaught error in app:", error);
    }

    render() {
        if (this.state.hasError) {
            return <Maintenance />;
        }
        return this.props.children;
    }
}

function InitializationCheck({ children }: { children: preact.ComponentChildren }) {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        void (async () => {
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
        })();
    }, []);

    if (status === "loading") {
        return <Loading isLoading={true} onLoaded={() => undefined} />;
    }

    if (status === "error" || (appStore.connectionError && !appStore.currentUserId)) {
        return <Maintenance />;
    }

    return <>{children}</>;
}

export function App() {
    useEffect(() => {
        registerServiceWorker().catch((error: unknown) => {
            Logger.error("Failed to register Service Worker:", error);
        });
    }, []);

    const routeComponents = useMemo(
        () =>
            routes.map(({ path, component }) => (
                <Route key={path} path={path} component={component} />
            )),
        [],
    );

    return (
        <ErrorBoundary>
            <LocationProvider>
                <InitializationCheck>
                    <main>
                        <Router>{routeComponents}</Router>
                    </main>
                </InitializationCheck>
            </LocationProvider>
        </ErrorBoundary>
    );
}

const appContainer = document.getElementById("app");
if (!appContainer) {
    throw new Error("Container #app not found");
}
render(<App />, appContainer);