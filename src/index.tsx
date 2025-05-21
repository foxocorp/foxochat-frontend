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

import { Home } from "./pages/Home";
import { NotFound } from "./pages/404";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import EmailConfirmationHandler from "./pages/Auth/Email/Verify";

import { RouteConfig } from "@interfaces/interfaces";

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
                        <Route key={ path } path={ path } component={ component } />
                    ))}
                </Router>
            </main>
        </LocationProvider>
    );
}

const appContainer = document.getElementById("app");
if (!appContainer) {
    throw new Error("Container #app not found");
}
render(<App />, appContainer);
