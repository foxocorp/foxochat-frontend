import styles from "./Maintenance.module.scss";
import HammerIcon from "@icons/errors/hammer.svg";
import { Button } from "@components/Base/Buttons/Button";

export function Maintenance() {
    const statusPage = () =>
    { window.open("https://status.foxogram.su", "_blank", "noopener,noreferrer")};
    const discordServer = () =>
    { window.open("https://discord.foxogram.su", "_blank", "noopener,noreferrer")};

    return (
        <div className={styles["maintenance-page"]}>
            <div className={styles["maintenance-page-wrapper"]}>
                <div className={styles["content"]}>
                    <div className={styles["hammer"]}>
                        <img src={HammerIcon} alt="Maintenance" />
                    </div>
                    <div className={styles["text"]}>
                        <h1>
                            Whoops, we are<br />
                            under <span className={styles.danger}>maintenance</span>
                        </h1>
                        <p>
                            We need time to fix what&#39;s broken and improve what&#39;s working...
                        </p>
                        <div className={styles["buttons"]}>
                            <Button variant="danger" width={141} onClick={discordServer}>
                                Discord Server
                            </Button>
                            <Button variant="secondary" width={121} onClick={statusPage}>
                                Status Page
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
