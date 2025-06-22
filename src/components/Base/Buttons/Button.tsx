import { ButtonProps } from "@interfaces/interfaces";
import { JSX } from "preact";
import * as styles from "./Buttons.module.scss";

export function Button({
	children,
	width = 368,
	fontSize = 16,
	fontWeight,
	height,
	centerText = false,
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

	const buttonClass =
		`${variantClass} ${centerText ? styles.centerText : ""} ${disabled ? (styles.buttonDisabled ?? "") : ""} ${className}`.trim();

	const buttonStyle: JSX.CSSProperties = Object.assign(
		{},
		{
			width: typeof width === "number" ? `${width}px` : width,
			fontSize: typeof fontSize === "number" ? `${fontSize}px` : fontSize,
			fontWeight: typeof fontWeight === "number" ? fontWeight : 400,
			height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
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
			type={type}
		>
			{children}
			{icon && <img src={icon} alt="icon" className={styles.buttonIcon} />}
		</button>
	);
}
