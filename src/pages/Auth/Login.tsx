import { useState } from "preact/hooks";
import { JSX } from "preact";
import styles from "./Login.module.css";
import { Button } from "@components/base/buttons/Button";
import { PasswordResetModal } from "@components/modal/PasswordReset/PasswordResetModal.tsx";
import arrowLeftIcon from "@icons/navigation/arrow-left.svg";
import resetPasswordIcon from "@icons/navigation/reset-password.svg";
import newUserIcon from "@icons/navigation/new-user.svg";
import { login, resetPassword, confirmResetPassword, resendEmailVerification } from "@services/api/apiMethods.ts";
import { useAuthStore } from "@store/authenticationStore.ts";
import { useLocation } from "preact-iso";

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

	const validatePassword = (password: string): boolean => {
		return password.length >= 4 && password.length <= 128;
	};

	const handleLogin = async (e: Event): Promise<void> => {
		e.preventDefault();

		setEmailError(false);
		setPasswordError(false);

		let isValid = true;

		if (!email || !validateEmail(email)) {
			setEmailError(true);
			isValid = false;
		}

		if (!password || !validatePassword(password)) {
			setPasswordError(true);
			isValid = false;
		}

		if (!isValid) return;

		try {
			const response = await login(email, password);
			if (response?.accessToken) {
				authStore.login(response.accessToken);
				console.log("Successful login");
			} else {
				console.error("Login error. Please try again.");
			}
		} catch (error) {
			console.error("Error during login:", error);
		}
	};

	const handleEmailInput = (e: Event): void => {
		const value = (e.target as HTMLInputElement).value;
		setEmail(value);
	};

	const handlePasswordInput = (e: Event): void => {
		const value = (e.target as HTMLInputElement).value;
		setPassword(value);
		setPasswordError(false);
	};

	const openPasswordResetModal = (): void => {
		setPasswordResetModalOpen(true);
	};

	const closePasswordResetModal = (): void => {
		setPasswordResetModalOpen(false);
	};

	const sendResetEmail = async (email: string): Promise<void> => {
		try {
			await resetPassword(email);
			console.log("Reset email sent");
		} catch (error) {
			console.error("Error sending reset password email:", error);
		}
	};

	const verifyResetCode = async (code: string): Promise<void> => {
		try {
			await confirmResetPassword(email, code, password);
			console.log("Reset code verified");
		} catch (error) {
			console.error("Error verifying reset password code:", error);
		}
	};

	const resendResetCode = async (): Promise<void> => {
		try {
			await resendEmailVerification();
			console.log("Reset code resent");
		} catch (error) {
			console.error("Error resending reset password code:", error);
		}
	};

	return (
		<div className={styles["login-container"]}>
			<div className={styles["login-form"]}>
				<div className={styles["login-form-header"]}>
					<div className={styles["login-form-title"]}>
						<div className={styles["form"]}>
							<div className={styles["login-title"]}>Log in</div>
							<div className={styles["form-login"]}>
								<div className={styles["login"]}>
									<label className={styles["login-label"]}>
										Email<span className={styles["required"]}>*</span>
									</label>
									<input
										type="email"
										className={`${styles["login-input"]} ${emailError ? styles["input-error"] : ""}`}
										placeholder="floofer@coof.fox"
										value={email}
										onInput={handleEmailInput}
										onBlur={() => setEmailError(!validateEmail(email))}
										required
									/>
									{emailError && (
										<span className={`${styles["error-text"]}`} style={{ top: "18%", left: "70px" }}>— Incorrect format</span>
									)}
									<label className={styles["login-label"]}>
										Password<span className={styles["required"]}>*</span>
									</label>
									<input
										type="password"
										className={`${styles["login-input"]} ${passwordError ? styles["input-error"] : ""}`}
										placeholder="your floof password :3"
										value={password}
										onInput={handlePasswordInput}
										required
									/>
									{passwordError && (
										<span className={`${styles["error-text"]}`} style={{ top: "39.5%", left: "107px" }}>— Incorrect format</span>
									)}
								</div>
							</div>

						</div>
						<div className={styles["login-button"]}>
							<Button variant="primary" onClick={handleLogin} icon={arrowLeftIcon}>
								Log in
							</Button>
						</div>
						<div className={styles["divider"]} />
						<div className={styles["action-buttons"]}>
							<Button variant="secondary" onClick={openPasswordResetModal} icon={resetPasswordIcon}>
								Reset your password
							</Button>
							<Button
								variant="secondary"
								onClick={() => {
									location.route("/auth/register");
								}}
								icon={newUserIcon}
							>
								Create new account
							</Button>
						</div>
					</div>
				</div>
			</div>
			<PasswordResetModal
				isOpen={isPasswordResetModalOpen}
				email={email}
				onClose={closePasswordResetModal}
				onSendEmail={sendResetEmail}
				onVerifyCode={verifyResetCode}
				onResendCode={resendResetCode}
				onResetPassword={resetPassword}
			/>
		</div>
	);
};

export default Login;