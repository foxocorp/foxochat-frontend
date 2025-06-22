import { useLocation } from "preact-iso";
import { useEffect, useState } from "preact/hooks";
import * as styles from "./Register.module.scss";

import arrowLeftIcon from "@/assets/icons/auth/auth-arrow-left.svg";
import alreadyHaveAccountIcon from "@/assets/icons/auth/auth-login.svg";

import { Button } from "@components/Base";
import { EmailConfirmationModal } from "@components/Modal/EmailConfirmation/EmailConfirmationModal";
import { Modal } from "@components/Modal/Modal";

import { apiMethods } from "@services/API/apiMethods";
import { useAuthStore } from "@store/authenticationStore";
import { Logger } from "@utils/logger";

const Register = () => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState({
		username: false,
		email: false,
		password: false,
	});

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
	const [modalMessage, setModalMessage] = useState("");

	const authStore = useAuthStore();
	const location = useLocation();

	useEffect(() => {
		const errorMessage = location.query.error;
		if (errorMessage) {
			switch (errorMessage) {
				case "email-confirmation-failed":
					setModalMessage("Email confirmation failed. Please try again.");
					break;
				case "invalid-code":
					setModalMessage(
						"The verification code is invalid. Please try again.",
					);
					break;
				default:
					setModalMessage("An unknown error occurred.");
					break;
			}
			setIsErrorModalOpen(true);
		}
	}, [location.query]);

	const validateUsername = (username: string): boolean => {
		const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
		return usernameRegex.test(username);
	};

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email) && email.length >= 4 && email.length <= 64;
	};

	const handleRegister = async () => {
		const newErrors = { username: false, email: false, password: false };
		let isValid = true;

		if (!username.trim() || !validateUsername(username)) {
			newErrors.username = true;
			isValid = false;
		}
		if (!email.trim() || !validateEmail(email)) {
			newErrors.email = true;
			isValid = false;
		}
		if (!password.trim()) {
			newErrors.password = true;
			isValid = false;
		}

		setErrors(newErrors);
		if (!isValid) return;

		try {
			const token = await apiMethods.register(username, email, password);
			if (token.access_token) {
				authStore.login(token.access_token);
				setIsModalOpen(true);
			} else {
				setModalMessage("— Registration failed. Please try again.");
				setIsErrorModalOpen(true);
			}
		} catch (error) {
			Logger.error(`Error during registration: ${JSON.stringify(error)}`);
			Logger.error(`Error keys: ${Object.keys(error as any).join(", ")}`);

			let errorMsg = "— An unexpected error occurred";

			const exception = (error as any).exception;
			if (exception?.message) {
				errorMsg = `— ${exception.message}`;
			}

			setModalMessage(errorMsg);
			setIsErrorModalOpen(true);
		}
	};

	const handleVerifyEmail = async (code: string) => {
		try {
			await apiMethods.verifyEmail(code);
			setIsModalOpen(false);
			location.route("/");
		} catch (error) {
			Logger.error(`Error during email verification: ${JSON.stringify(error)}`);
			setModalMessage("— An error occurred during email verification.");
			setIsErrorModalOpen(true);
		}
	};

	const handleResendEmail = async () => {
		try {
			await apiMethods.resendEmailVerification();
		} catch (error) {
			Logger.error(`Error during resend email: ${JSON.stringify(error)}`);
			setModalMessage("— An error occurred while resending the email.");
			setIsErrorModalOpen(true);
		}
	};

	const renderError = (field: keyof typeof errors) => {
		if (!errors[field]) return null;
		const errorPositions = {
			username: { top: "19.5%", left: "140px" },
			email: { top: "36%", left: "97px" },
			password: { top: "53%", left: "135px" },
		};
		return (
			<span className={styles.errorText} style={errorPositions[field]}>
				— Incorrect format
			</span>
		);
	};

	const handleKeyDown = (e: KeyboardEvent): void => {
		if (e.key === "Enter") {
			e.preventDefault();
			void handleRegister();
		}
	};

	return (
		<div className={styles.registerContainer} onKeyDown={handleKeyDown}>
			{isErrorModalOpen && modalMessage && (
				<Modal
					title="Error"
					description={modalMessage}
					onClose={() => {
						setIsErrorModalOpen(false);
					}}
					actionButtons={[
						<Button
							key="close-button"
							onClick={() => {
								setIsErrorModalOpen(false);
							}}
							variant="primary"
							icon={arrowLeftIcon}
						>
							Close
						</Button>,
					]}
				/>
			)}
			{isModalOpen && (
				<EmailConfirmationModal
					isOpen={isModalOpen}
					email={email}
					onClose={() => {
						setIsModalOpen(false);
					}}
					onVerify={handleVerifyEmail}
					onResendCode={handleResendEmail}
				/>
			)}
			<div className={styles.registerForm}>
				<div className={styles.registerTitle}>Register</div>
				<div className={styles.registerFormContent}>
					<label className={styles.registerLabel}>
						Username<span className={styles.required}>*</span>
					</label>
					<input
						type="text"
						className={`${styles.registerInput} ${errors.username ? styles.inputError : ""}`}
						placeholder="floof_fox"
						value={username}
						onInput={(e) => {
							setUsername((e.target as HTMLInputElement).value);
						}}
						required
						autoComplete="nope"
					/>
					{renderError("username")}
					<label className={styles.registerLabel}>
						Email<span className={styles.required}>*</span>
					</label>
					<input
						type="email"
						className={`${styles.registerInput} ${errors.email ? styles.inputError : ""}`}
						placeholder="floofer@coof.fox"
						value={email}
						onInput={(e) => {
							setEmail((e.target as HTMLInputElement).value);
						}}
						required
					/>
					{renderError("email")}
					<label className={styles.registerLabel}>
						Password<span className={styles.required}>*</span>
					</label>
					<input
						type="password"
						className={`${styles.registerInput} ${errors.password ? styles.inputError : ""}`}
						placeholder="your floof password :3"
						value={password}
						onInput={(e) => {
							setPassword((e.target as HTMLInputElement).value);
						}}
						required
					/>
					{renderError("password")}
					<Button
						key="register-button"
						variant="primary"
						fontSize={20}
						fontWeight={600}
						onClick={handleRegister}
						icon={arrowLeftIcon}
						className={styles.registerButton}
					>
						Register
					</Button>
					<div className={styles.divider} />
					<Button
						key="login-button"
						variant="secondary"
						onClick={() => {
							location.route("/login");
						}}
						icon={alreadyHaveAccountIcon}
						className={styles.buttonWithGap}
					>
						Already have an account?
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Register;
