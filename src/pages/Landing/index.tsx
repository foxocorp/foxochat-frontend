import { Button } from "@components/Base/Buttons/Button";
import { useAuthStore } from "@store/authenticationStore";
import { useLocation } from "preact-iso";
import appStore from "@store/app";
import * as styles from "./Landing.module.scss";

import BoltIcon from "@/assets/landing/svg/bolt.svg";

export default function Landing() {
	const location = useLocation();
	const authStore = useAuthStore();

	const openApp = () => {
		if (authStore.isAuthenticated) {
			if (appStore.channels.length > 0 && appStore.channels[0]) {
				window.location.href = `/channels/#${appStore.channels[0].id}`;
			} else {
				window.location.href = "/channels";
			}
		} else {
			location.route("/login", true);
		}
	};

	const statusPage = () => {
		window.open(
			"https://status.foxochat.app/",
			"_blank",
			"noopener,noreferrer",
		);
	};

	return (
		<div className={styles.landingPage}>
			<div className={styles.landingPageWrapper}>
				<div className={styles.content}>
					<div className={styles.bolt}>
						<img src={BoltIcon} alt="FoxoChat" />
					</div>
					<div className={styles.text}>
						<h1>
							FoxoChat is
							<br />
							being <span className={styles.branded}>rewritten</span>
						</h1>
						<p>
							We're trying to create a better place to talk to your floof
							friends.
						</p>
						<div className={styles.buttons}>
							<Button
								variant="branded"
								width={175}
								centerText={true}
								onClick={openApp}
							>
								{authStore.isAuthenticated ? "Open App" : "Sign In"}
							</Button>
							<Button
								variant="primary"
								width={175}
								centerText={true}
								onClick={statusPage}
							>
								Status Page
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
