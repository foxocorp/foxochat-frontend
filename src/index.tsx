import "preact/debug"; // disable in production

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
import { LocationProvider, Router, Route } from "preact-iso";
import { Workbox } from "workbox-window";

import { Home } from "./pages/Home";
import { NotFound } from "./pages/404";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import EmailConfirmationHandler from "./pages/Auth/Email/Verify";

import { RouteConfig } from "@interfaces/interfaces";

import { Logger } from "@utils/logger";

export const routes: RouteConfig[] = [
    { path: "/", component: Home },
    { path: "/auth/login", component: Login },
    { path: "/auth/register", component: Register },
    { path: "/auth/email/verify", component: EmailConfirmationHandler },
    { path: "*", component: NotFound },
];

export function App() {
    return (
        <LocationProvider>
            <main>
                <Router>
                    {routes.map(({ path, component }) => (
                        <Route key={path} path={path} component={component} />
                    ))}
                </Router>
            </main>
        </LocationProvider>
    );
}

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

const appContainer = document.getElementById("app");
if (!appContainer) {
    throw new Error("Container #app not found");
}
render(<App />, appContainer);

registerServiceWorker().then(() => {
    Logger.info("Service Worker registration completed");
}).catch((error: unknown) => {
    Logger.error("Failed to register Service Worker:", error);
});