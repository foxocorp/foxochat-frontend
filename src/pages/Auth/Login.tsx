import { useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { JSX } from "preact";

import styles from "./Login.module.css";

import { Button } from "@components/base/buttons/Button";
import { PasswordResetModal } from "@components/modal/PasswordResetModal";

import arrowLeftIcon from "@icons/arrow-left.svg";
import resetPasswordIcon from "@icons/reset-password.svg";
import newUserIcon from "@icons/new-user.svg";

import { RESTPostAPIAuthLoginBody } from "@foxogram/api-types";
import { apiMethods as api } from "@services/api/authenticationService.ts";
import { useAuthStore } from "@store/authenticationStore.ts";

const Login = (): JSX.Element => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [emailError, setEmailError] = useState<boolean>(false);
	const [passwordError, setPasswordError] = useState<boolean>(false);
	const [isPasswordResetModalOpen, setPasswordResetModalOpen] = useState<boolean>(false);
	const authStore = useAuthStore();
	const location = useLocation();

	const handleLogin = async (e: Event): Promise<void> => {
		e.preventDefault();

		if (!email || !password) {
			setEmailError(!email);
			setPasswordError(!password);
			return;
		}

		const body: RESTPostAPIAuthLoginBody = { email, password };

		try {
			const response = await api.login(body);
			if (response.accessToken) {
				authStore.login(response.accessToken);
				alert("Successful login");
			} else {
				alert("Login error. Try again");
			}
		} catch (error) {
			console.error("Error during login:", error);
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			alert(`Error: ${errorMessage}`);
		}
	};

	const handleEmailInput = (e: Event): void => {
		const value = (e.target as HTMLInputElement).value;
		setEmail(value);
		setEmailError(false);
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
			await api.resetPassword(email);
			alert("Reset password email sent successfully");
		} catch (error) {
			console.error("Error sending reset password email:", error);
			alert("Failed to send reset password email");
		}
	};

	const verifyResetCode = async (code: string): Promise<void> => {
		try {
			await api.resetPasswordConfirm(email, code, password);
			alert("Verification code is valid");
		} catch (error) {
			console.error("Error verifying reset password code:", error);
			alert("Invalid or expired code");
		}
	};

	const resendResetCode = async (): Promise<void> => {
		try {
			await api.resendEmail();
			alert("Reset password code resent");
		} catch (error) {
			console.error("Error resending reset password code:", error);
			alert("Failed to resend reset password code");
		}
	};

	const resetPassword = async (newPassword: string): Promise<void> => {
		try {
			await api.resetPasswordConfirm(email, "", newPassword);
			alert("Password reset successfully");
		} catch (error) {
			console.error("Error resetting password:", error);
			alert("Failed to reset password");
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
									<label className={styles["login-label"]}>Email<span className={styles["required"]}>*</span></label>
									<input
										type="email"
										className={`${styles["login-input"]} ${emailError ? styles["input-error"] : ""}`}
										placeholder="floofer@coof.fox"
										value={email}
										onInput={handleEmailInput}
										required
									/>
									<label className={styles["login-label"]}>Password<span className={styles["required"]}>*</span></label>
									<input
										type="password"
										className={`${styles["login-input"]} ${passwordError ? styles["input-error"] : ""}`}
										placeholder="your floof password :3"
										value={password}
										onInput={handlePasswordInput}
										required
									/>
								</div>
							</div>
						</div>
						<div className={styles["login-button"]}>
							<Button variant="primary" onClick={handleLogin} icon={arrowLeftIcon}>
								Log in
							</Button>
						</div>
						<div className={styles["divider"]} />
						<div className={styles["social-buttons"]}>
							<Button variant="secondary" onClick={openPasswordResetModal} icon={resetPasswordIcon}>
								Reset your password
							</Button>
							<Button variant="secondary" onClick={() => { location.route("/auth/register"); }} icon={newUserIcon}>
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
