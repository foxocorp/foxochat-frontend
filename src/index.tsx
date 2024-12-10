import "preact/debug"; // disable in production

import "@fontsource/inter";
import "@fontsource/inter/900.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/500.css";
import "./style.css";

import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import { Home } from "./pages/Home";
import { NotFound } from "./pages/_404.jsx";
import Login from "./pages/Auth/Login.tsx";
import Register from "./pages/Auth/Register.tsx";

export function App() {
	return (
		<LocationProvider>
			<main>
				<Router>
					<Route path="/" component={Home} />
					<Route path="/auth/login" component={Login} />
					<Route path="/auth/register" component={Register} />
					<Route default component={NotFound} />
				</Router>
			</main>
		</LocationProvider>
	);
}

render(<App />, document.getElementById("app")!);
