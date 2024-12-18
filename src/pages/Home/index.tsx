import { useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import "./style.css";
import Loading from "../../components/LoadingApp.tsx";

export function Home() {
	const [isLoading, setIsLoading] = useState(true);
	const location = useLocation();

	const handleLoaded = () => {
		setIsLoading(false);
		location.route("/auth/login");
	};

	if (isLoading) {
		return <Loading onLoaded={handleLoaded} />;
	}

	return null;
}
