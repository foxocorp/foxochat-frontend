import { ComponentChildren, JSX } from "preact";
import styles from "./Buttons.module.scss";

interface ButtonProps {
	children: ComponentChildren;
	width?: number | string;
	fontSize?: number | string;
	fontWeight?: number | string;
	onClick?: () => void | Promise<void>;
	variant?: "primary" | "secondary" | "danger" | "default" | "branded";
	icon?: string | undefined;
	disabled?: boolean;
	type?: "button" | "submit" | "reset";
	style?: JSX.CSSProperties;
	className?: string;
}

export function Button({
						   children,
						   width = 368,
						   fontSize = 16,
						   fontWeight,
						   onClick,
						   variant = "default",
						   icon,
						   disabled = false,
						   type = "button",
						   style,
						   className = "",
					   }: ButtonProps) {
	const variantClass = {
		primary: styles.buttonPrimary,
		branded: styles.buttonBranded,
		secondary: styles.buttonSecondary,
		danger: styles.buttonDanger,
		default: "",
	}[variant];

	const buttonClass = `${variantClass} ${disabled ? styles.buttonDisabled ?? "" : ""} ${className}`.trim();

	const buttonStyle: JSX.CSSProperties = Object.assign(
		{},
		{
			width: typeof width === "number" ? `${width}px` : width,
			fontSize: typeof fontSize === "number" ? `${fontSize}px` : fontSize,
			fontWeight: typeof fontWeight === "number" ? fontWeight : 400,
		},
		style ?? {},
	);

	const handleClick = () => {
		if (onClick) void onClick();
	};

	return (
		<button
			className={buttonClass}
			style={buttonStyle}
			onClick={handleClick}
			disabled={disabled}
			type={type}>
			{children}
			{icon && <img src={icon} alt="icon" className={styles.buttonIcon} />}
		</button>
	);
}