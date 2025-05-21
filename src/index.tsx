import "preact/debug"; // Disable in production

import "@fontsource/inter/900.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter"; //400
import "@fontsource/inter/300.css";
import "@fontsource/inter/200.css";

import "./style.scss";
import "./scss/style.scss";

import { render } from "preact";
import { useState, useEffect } from "preact/hooks";
import { LocationProvider, Router, Route } from "preact-iso";
import { Workbox } from "workbox-window";

import { Home } from "./pages/Home";
import { NotFound } from "./pages/Fallbacks/NotFound/NotFound";
import { Maintenance } from "./pages/Fallbacks/Maintenance/Maintenance";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import EmailConfirmationHandler from "./pages/Auth/Email/Verify";

import { RouteConfig } from "@interfaces/interfaces";
import { chatStore } from "@store/chat/chatStore";
import { Logger } from "@utils/logger";

export const routes: RouteConfig[] = [
    { path: "/", component: Home },
    { path: "/auth/login", component: Login },
    { path: "/auth/register", component: Register },
    { path: "/auth/email/verify", component: EmailConfirmationHandler },
    { path: "*", component: NotFound },
];

function InitializationCheck({ children }: { children: preact.ComponentChildren }) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const checkInitialization = async () => {
            try {
                await chatStore.initializeStore();
                setIsInitialized(true);
            } catch (error) {
                Logger.error("Initialization failed:", error);
                setIsInitialized(false);
            }
        };

        void checkInitialization();
    }, []);

    if (!isInitialized || chatStore.connectionError || !chatStore.isWsInitialized) {
        return <Maintenance />;
    }

    return <>{children}</>;
}

export function App() {
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

    useEffect(() => {
        registerServiceWorker().catch((error: unknown) => {
            Logger.error("Failed to register Service Worker:", error);
        });
    }, []);

    return (
        <LocationProvider>
            <InitializationCheck>
                <main>
                    <Router>
                        {routes.map(({ path, component }) => (
                            <Route key={path} path={path} component={component} />
                        ))}
                    </Router>
                </main>
            </InitializationCheck>
        </LocationProvider>
    );
}

const appContainer = document.getElementById("app");
if (!appContainer) {
    throw new Error("Container #app not found");
}
render(<App />, appContainer);