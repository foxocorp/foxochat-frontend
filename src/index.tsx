import "preact/debug"; // disable in production

import "@fontsource/inter";
import "./style.css";

import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import { Home } from "./pages/Home";
import { NotFound } from "./pages/_404.jsx";
import LogIn from "./pages/Auth/Login.tsx";
import SignIn from "./pages/Auth/Register.tsx";

export function App() {
	return (
		<LocationProvider>
			<main>
				<Router>
					<Route path="/" component={Home} />
					<Route path="/auth/login" component={LogIn} />
					<Route path="/auth/register" component={SignIn} />
					<Route default component={NotFound} />
				</Router>
			</main>
		</LocationProvider>
	);
}

render(<App />, document.getElementById("app")!);
