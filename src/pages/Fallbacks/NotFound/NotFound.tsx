import { Button } from "@components/Base/Buttons/Button";
import handIcon from "@icons/errors/hand-error.svg";
import { useLocation } from "preact-iso";
import * as styles from "./NotFound.module.scss";

export function NotFound({ path }: { path: string }) {
	const location = useLocation();

	const truncatedUri = path.length > 30 ? `${path.substring(0, 30)}...` : path;

	const statusPage = () => {
		window.open("https://status.foxochat.app", "_blank", "noopener,noreferrer");
	};

	const returnPage = () => {
		location.route("/");
	};

	return (
		<div className={styles.errorPage}>
			<div className={styles.errorPageWrapper}>
				<div className={styles.content}>
					<div className={styles.hand}>
						<img src={handIcon} alt="404" />
					</div>
					<div className={styles.text}>
						<h1>404</h1>
						<p>
							Looks like you&#39;re lost...
							<br />
							There&#39;s no page for{" "}
							<span className={styles.uri}>{truncatedUri}</span>
						</p>
						<div className={styles.buttons}>
							<Button variant={"danger"} width={150} onClick={returnPage}>
								Return to Home
							</Button>
							<Button variant={"secondary"} width={125} onClick={statusPage}>
								Status Page
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
