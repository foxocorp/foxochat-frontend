import { JSX } from "preact";
import { useLocation } from "preact-iso";
import { useEffect, useState } from "preact/hooks";

import { Button } from "@components/Base";
import { PasswordResetModal } from "@components/Modal/PasswordReset/PasswordResetModal";
import * as styles from "./Login.module.scss";

import arrowLeftIcon from "@/assets/icons/auth/auth-arrow-left.svg";
import newUserIcon from "@/assets/icons/auth/auth-new-user.svg";
import resetPasswordIcon from "@/assets/icons/auth/auth-reset-password.svg";

import { apiMethods } from "@services/API/apiMethods";
import { useAuthStore } from "@store/authenticationStore";
import { Logger } from "@utils/logger";

const Login = (): JSX.Element => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [emailError, setEmailError] = useState<boolean>(false);
	const [passwordError, setPasswordError] = useState<boolean>(false);
	const [emailErrorMessage, setEmailErrorMessage] =
		useState<string>("— Incorrect format");
	const [passwordErrorMessage, setPasswordErrorMessage] =
		useState<string>("— Incorrect format");
	const [isPasswordResetModalOpen, setPasswordResetModalOpen] =
		useState<boolean>(false);

	const authStore = useAuthStore();
	const location = useLocation();

	useEffect(() => {
		if (authStore.isAuthenticated) {
			location.route('/channels');
		}
	}, [authStore.isAuthenticated, location]);

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email) && email.length >= 4 && email.length <= 64;
	};

	const handleLogin = async (): Promise<void> => {
		setEmailError(false);
		setPasswordError(false);
		setEmailErrorMessage("— Incorrect format");
		setPasswordErrorMessage("— Incorrect format");

		let isValid = true;

		if (!email || !validateEmail(email)) {
			setEmailError(true);
			isValid = false;
		}

		if (!password) {
			setPasswordError(true);
			isValid = false;
		}

		if (!isValid) return;

		try {
			const response = await apiMethods.login(email, password);
			if (response.access_token) {
				await authStore.login(response.access_token);
				Logger.info("Successful login");
				location.route("/channels");
			} else {
				Logger.error("Login error");
			}
		} catch (error) {
			Logger.error(`Error during login: ${JSON.stringify(error)}`);
			Logger.error(`Error keys: ${Object.keys(error as any).join(", ")}`);

			let errorMsg = "— An unexpected error occurred";

			const exception = (error as any)?.exception;
			if (exception && exception.message) {
				errorMsg = `— ${exception.message}`;
				if (exception.message.toLowerCase().includes("email")) {
					setEmailError(true);
					setEmailErrorMessage(errorMsg);
				}
				if (exception.message.toLowerCase().includes("password")) {
					setPasswordError(true);
					setPasswordErrorMessage(errorMsg);
				}
				if (!emailError && !passwordError) {
					setEmailError(true);
					setPasswordError(true);
					setEmailErrorMessage(errorMsg);
					setPasswordErrorMessage(errorMsg);
				}
			} else {
				setEmailError(true);
				setPasswordError(true);
				setEmailErrorMessage(errorMsg);
				setPasswordErrorMessage(errorMsg);
			}
		}
	};

	const openPasswordResetModal = (): void => {
		setPasswordResetModalOpen(true);
	};

	const closePasswordResetModal = (): void => {
		setPasswordResetModalOpen(false);
	};

	const handleKeyDown = (e: KeyboardEvent): void => {
		if (e.key === "Enter") {
			e.preventDefault();
			void handleLogin();
		}
	};

	const renderError = (field: "email" | "password") => {
		if (field === "email" && !emailError) return null;
		if (field === "password" && !passwordError) return null;

		const errorPositions = {
			email: { top: "21%", left: "96px" },
			password: { top: "39.5%", left: "135px" },
		};

		const errorMessages = {
			email: emailErrorMessage,
			password: passwordErrorMessage,
		};

		return (
			<span className={styles.errorText} style={errorPositions[field]}>
				{errorMessages[field]}
			</span>
		);
	};

	return (
		<div className={styles.loginContainer}>
			<div className={styles.loginForm} onKeyDown={handleKeyDown}>
				<div className={styles.loginTitle}>Log in</div>
				<div className={styles.loginFormContent}>
					<label className={styles.loginLabel}>
						Email<span className={styles.required}>*</span>
					</label>
					<input
						type="email"
						className={`${styles.loginInput} ${emailError ? styles.inputError : ""}`}
						placeholder="floofer@coof.fox"
						value={email}
						onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
						required
					/>
					{renderError("email")}
					<label className={styles.loginLabel}>
						Password<span className={styles.required}>*</span>
					</label>
					<input
						type="password"
						className={`${styles.loginInput} ${passwordError ? styles.inputError : ""}`}
						placeholder="your floof password :3"
						value={password}
						onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
						required
					/>
					{renderError("password")}
					<Button
						key="login-button"
						variant="primary"
						fontSize={20}
						fontWeight={600}
						onClick={handleLogin}
						icon={arrowLeftIcon}
						className={styles.loginButton}
					>
						Log in
					</Button>
					<div className={styles.divider} />
					<Button
						className={styles.buttonWithGap}
						key="reset-password-button"
						variant="secondary"
						onClick={openPasswordResetModal}
						icon={resetPasswordIcon}
					>
						Reset your password
					</Button>
					<Button
						key="create-account-button"
						variant="secondary"
						onClick={() => location.route("/auth/register")}
						icon={newUserIcon}
					>
						Create new account
					</Button>
				</div>
			</div>
			<PasswordResetModal
				isOpen={isPasswordResetModalOpen}
				email={email}
				onClose={closePasswordResetModal}
				onSendEmail={apiMethods.resetPassword}
				onVerifyCode={(code) =>
					apiMethods.confirmResetPassword(email, code, password)
				}
				onResetPassword={apiMethods.resetPassword}
				onResendCode={apiMethods.resendEmailVerification}
			/>
		</div>
	);
};

export default Login;
