import React from "react";
import styles from "./AuthenticationActionButtons.module.css";

interface AuthenticationActionButtonProps {
	icon: string;
	label: string;
	action: () => void;
}

export const AuthenticationActionButton: React.FC<AuthenticationActionButtonProps> = ({
																						  icon,
																						  label,
																						  action,
																					  }) => {
	return (
		<button className={styles["form-login-button"]} onClick={action}>
			<img src={icon} alt={`${label} login`} />
		</button>
	);
};

interface AuthenticationActionButtonsProps {
	buttons: { icon: string; label: string; action: () => void }[];
}

export const AuthenticationActionButtons: React.FC<AuthenticationActionButtonsProps> = ({
																							buttons,
																						}) => {
	return (
		<div className={styles["form-login-buttons"]}>
			{buttons.map((button, index) => (
				<AuthenticationActionButton
					key={index}
					icon={button.icon}
					label={button.label}
					action={button.action}
				/>
			))}
		</div>
	);
};
