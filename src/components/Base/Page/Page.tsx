import { ComponentChildren } from "preact";
import * as styles from "./Page.module.scss";

interface PageProps {
	children: ComponentChildren;
}

export const Page = ({ children }: PageProps) => {
	return (
		<div className={styles.page}>
			{children}
		</div>
	);
}; 