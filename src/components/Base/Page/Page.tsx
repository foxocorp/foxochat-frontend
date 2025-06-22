import { ComponentChildren } from "preact";
import * as styles from "./Page.module.scss";
import { classNames } from "@utils/functions";

interface PageProps {
	children: ComponentChildren;
    center?: boolean;
}

export const Page = ({ children, center }: PageProps) => {
	return (
		<div className={classNames(styles.page, center && styles.centered)}>
			{children}
		</div>
	);
}; 