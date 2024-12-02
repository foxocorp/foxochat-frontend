import "preact/debug";

import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import { Header } from "@components/Header";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/_404.jsx";
import "./style.css";
import { Login } from "./pages/Auth/login";

export function App() {
	return (
		<LocationProvider>
			<Header />

			<main>
				<Router>
					<Route path="/" component={Home} />
					<Route path="/auth/login" component={Login} />
					<Route default component={NotFound} />
				</Router>
			</main>
		</LocationProvider>
	);
}

render(<App />, document.getElementById("app"));
