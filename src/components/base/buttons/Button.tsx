import React from "react";
import "./Buttons.css";

interface ButtonProps {
	children: React.ReactNode;
	width?: number;
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	variant?: "primary" | "secondary" | "danger" | "default";
	icon?: string | undefined;
	disabled?: boolean;
}

export function Button({ children, width = 368, variant = "default", onClick, icon, disabled = false }: ButtonProps) {
	const buttonClass = `button-${variant} ${disabled ? "button-disabled" : ""}`;

	return (
		<button className={buttonClass} style={{ width }} onClick={onClick} disabled={disabled}>
			<span className="button-text">{children}</span>
			{icon && <img src={icon} alt="icon" className="button-icon" />}
		</button>
	);
}
