import { JSX, ComponentChildren } from "preact";
import "./Buttons.css";

interface ButtonProps {
	children: ComponentChildren;
	width?: number;
	onClick?: (event: JSX.TargetedEvent<HTMLButtonElement, MouseEvent>) => void;
	variant?: "primary" | "secondary" | "danger" | "default";
	icon?: string | undefined;
	disabled?: boolean;
	type?: "button" | "submit" | "reset" | undefined;
}

export function Button({ children, width = 368, variant = "default", onClick, icon, disabled = false, type }: ButtonProps) {
	const buttonClass = `button-${variant} ${disabled ? "button-disabled" : ""}`;

	return (
		<button className={buttonClass} style={{ width }} onClick={onClick} disabled={disabled} type={type}>
			<span className="button-text">{children}</span>
			{icon && <img src={icon} alt="icon" className="button-icon" />}
		</button>
	);
}
