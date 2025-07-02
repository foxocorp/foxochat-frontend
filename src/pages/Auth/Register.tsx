import { Button } from "@components/Base";
import { EmailConfirmationModal } from "@components/Modal/EmailConfirmation/EmailConfirmationModal";
import { Modal } from "@components/Modal/Modal";
import { apiMethods } from "@services/API/apiMethods";
import { useAuthStore } from "@store/authenticationStore";
import { Logger } from "@utils/logger";
import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import arrowLeftIcon from "@/assets/icons/auth/auth-arrow-right.svg";
import arrowRightIcon from "@/assets/icons/auth/auth-arrow-right.svg";
import Illustration from "@/assets/icons/auth/illustration.png";
import { usePageTransitionContext } from "@/contexts/PageTransitionContext";
import * as styles from "./Register.module.scss";

const Register = (): JSX.Element => {
	const [username, setUsername] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [usernameError, setUsernameError] = useState<boolean>(false);
	const [emailError, setEmailError] = useState<boolean>(false);
	const [passwordError, setPasswordError] = useState<boolean>(false);
	const [usernameErrorMessage, setUsernameErrorMessage] =
		useState<string>("— Incorrect format");
	const [emailErrorMessage, setEmailErrorMessage] =
		useState<string>("— Incorrect format");
	const [passwordErrorMessage, setPasswordErrorMessage] =
		useState<string>("— Incorrect format");
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
	const [modalMessage, setModalMessage] = useState<string>("");
	const [isAnimating, setIsAnimating] = useState<boolean>(false);
	const authStore = useAuthStore();
	const location = useLocation();
	const { isTransitioning, startTransition } = usePageTransitionContext();

	useEffect(() => {
		if (authStore.isAuthenticated) {
			location.route("/channels");
		}
	}, [authStore.isAuthenticated, location]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsAnimating(true);
		}, 50);

		const timer2 = setTimeout(() => {
			setIsAnimating(false);
		}, 650);

		return () => {
			clearTimeout(timer);
			clearTimeout(timer2);
		};
	}, []);

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
		setUsernameError(false);
		setEmailError(false);
		setPasswordError(false);
		setUsernameErrorMessage("— Incorrect format");
		setEmailErrorMessage("— Incorrect format");
		setPasswordErrorMessage("— Incorrect format");
		let isValid = true;
		if (!username.trim() || !validateUsername(username)) {
			setUsernameError(true);
			isValid = false;
		}
		if (!email.trim() || !validateEmail(email)) {
			setEmailError(true);
			isValid = false;
		}
		if (!password.trim()) {
			setPasswordError(true);
			isValid = false;
		}
		if (!isValid) return;
		try {
			const token = await apiMethods.register(username, email, password);
			if (token.access_token) {
				await authStore.login(token.access_token);
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
				if (exception.message.toLowerCase().includes("username")) {
					setUsernameError(true);
					setUsernameErrorMessage(errorMsg);
				}
				if (exception.message.toLowerCase().includes("email")) {
					setEmailError(true);
					setEmailErrorMessage(errorMsg);
				}
				if (exception.message.toLowerCase().includes("password")) {
					setPasswordError(true);
					setPasswordErrorMessage(errorMsg);
				}
				if (!usernameError && !emailError && !passwordError) {
					setUsernameError(true);
					setEmailError(true);
					setPasswordError(true);
					setUsernameErrorMessage(errorMsg);
					setEmailErrorMessage(errorMsg);
					setPasswordErrorMessage(errorMsg);
				}
			} else {
				setUsernameError(true);
				setEmailError(true);
				setPasswordError(true);
				setUsernameErrorMessage(errorMsg);
				setEmailErrorMessage(errorMsg);
				setPasswordErrorMessage(errorMsg);
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

	const renderError = (field: "username" | "email" | "password") => {
		if (field === "username" && !usernameError) return null;
		if (field === "email" && !emailError) return null;
		if (field === "password" && !passwordError) return null;
		const errorMessages = {
			username: usernameErrorMessage,
			email: emailErrorMessage,
			password: passwordErrorMessage,
		};
		return (
			<span className={styles.errorTextInline}>{errorMessages[field]}</span>
		);
	};

	const handleKeyDown = (e: KeyboardEvent): void => {
		if (e.key === "Enter") {
			e.preventDefault();
			void handleRegister();
		}
	};

	const handleNavigateToLogin = (): void => {
		startTransition("/login");
	};

	return (
		<div className={styles.registerPageWrapper}>
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
			<div className={styles.registerLeftCol}>
				<div
					className={`${styles.registerContainer} ${isAnimating ? styles.animateIn : ""} ${isTransitioning ? styles.animateOut : ""}`}
				>
					<form className={styles.registerForm} onKeyDown={handleKeyDown}>
						<div className={styles.registerTitle}>Good to see you!</div>
						<div className={styles.registerSubtitle}>
							Enter your information below to create an account
						</div>
						<div className={styles.registerFormContent}>
							<div className={styles.labelRow}>
								<label className={styles.registerLabel}>
									Username<span className={styles.required}>*</span>
								</label>
								{renderError("username")}
							</div>
							<input
								type="text"
								className={`${styles.registerInput} ${usernameError ? styles.inputError : ""}`}
								placeholder="your username"
								value={username}
								onInput={(e) =>
									setUsername((e.target as HTMLInputElement).value)
								}
								required
							/>
							<div className={styles.labelRow}>
								<label className={styles.registerLabel}>
									Email<span className={styles.required}>*</span>
								</label>
								{renderError("email")}
							</div>
							<input
								type="email"
								className={`${styles.registerInput} ${emailError ? styles.inputError : ""}`}
								placeholder="fox@foxochat.app"
								value={email}
								onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
								required
							/>
							<div className={styles.labelRow}>
								<label className={styles.registerLabel}>
									Password<span className={styles.required}>*</span>
								</label>
								{renderError("password")}
							</div>
							<input
								type="password"
								className={`${styles.registerInput} ${passwordError ? styles.inputError : ""}`}
								placeholder="Your password here"
								value={password}
								onInput={(e) =>
									setPassword((e.target as HTMLInputElement).value)
								}
								required
							/>
							<Button
								key="register-button"
								variant="branded"
								width={368}
								fontSize={16}
								fontWeight={600}
								onClick={handleRegister}
								icon={arrowRightIcon}
								className={styles.registerButton}
							>
								Continue
							</Button>
							<div className={styles.dividerRow}>
								<span className={styles.dividerLine}></span>OR
								<span className={styles.dividerLine}></span>
							</div>
							<Button
								className={styles.socialButton}
								width={368}
								variant="secondary"
								onClick={handleNavigateToLogin}
							>
								Log in with existing account
							</Button>
						</div>
					</form>
				</div>
			</div>
			<div className={styles.registerRightCol}>
				<img
					draggable={false}
					src={Illustration}
					className={styles.illustration}
					alt="Illustration"
				/>
			</div>
		</div>
	);
};

export default Register;
