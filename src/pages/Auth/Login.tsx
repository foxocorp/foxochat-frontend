import { useState } from "preact/hooks";
import { JSX } from "preact";
import { useLocation } from "preact-iso";

import styles from "./Login.module.scss";
import { Button } from "@components/Base";
import { PasswordResetModal } from "@components/Modal/PasswordReset/PasswordResetModal";

import arrowLeftIcon from "@icons/navigation/arrow-left.svg";
import resetPasswordIcon from "@icons/navigation/reset-password.svg";
import newUserIcon from "@icons/navigation/new-user.svg";

import { apiMethods } from "@services/API/apiMethods";
import { useAuthStore } from "@store/authenticationStore";
import { Logger } from "@utils/logger";
import appStore from "@store/app";

const Login = (): JSX.Element => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [emailError, setEmailError] = useState<boolean>(false);
	const [passwordError, setPasswordError] = useState<boolean>(false);
	const [isPasswordResetModalOpen, setPasswordResetModalOpen] = useState<boolean>(false);

	const authStore = useAuthStore();
	const location = useLocation();

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email) && email.length >= 4 && email.length <= 64;
	};

	const handleLogin = async (): Promise<void> => {
		setEmailError(false);
		setPasswordError(false);

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
				authStore.login(response.access_token);
				Logger.info("Successful login");
				location.route("/");
				await appStore.initializeStore();
			} else {
				Logger.error("Login error");
			}
		} catch (error) {
			Logger.error(`Error during login: ${error}`);
		}
	};

	const openPasswordResetModal = (): void => {
		setPasswordResetModalOpen(true);
	};

	const closePasswordResetModal = (): void => {
		setPasswordResetModalOpen(false);
	};

	return (
		<div className={styles.loginContainer}>
			<div className={styles.loginForm}>
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
						onInput={(e) => { setEmail((e.target as HTMLInputElement).value); }}
						required
					/>
					{emailError && (
						<span className={styles.errorText} style={{ top: "21%", left: "96px" }}>— Incorrect format</span>
					)}
					<label className={styles.loginLabel}>
						Password<span className={styles.required}>*</span>
					</label>
					<input
						type="password"
						className={`${styles.loginInput} ${passwordError ? styles.inputError : ""}`}
						placeholder="your floof password :3"
						value={password}
						onInput={(e) => { setPassword((e.target as HTMLInputElement).value); }}
						required
					/>
					{passwordError && (
						<span className={styles.errorText} style={{ top: "39.5%", left: "135px" }}>— Incorrect format</span>
					)}
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
						onClick={() => {location.route("/auth/register");}}
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
				onVerifyCode={(code) => apiMethods.confirmResetPassword(email, code, password)}
				onResetPassword={apiMethods.resetPassword}
				onResendCode={apiMethods.resendEmailVerification}
			/>
		</div>
	);
};

export default Login;