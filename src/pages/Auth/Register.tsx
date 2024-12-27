import { useLocation } from "preact-iso";
import { useState, useEffect } from "preact/hooks";
import { api } from "@services/api/authenticationService.ts";
import { useAuthStore } from "@store/authenticationStore.ts";
import { Button } from "@components/base";
import { EmailConfirmationModal } from "@components/modal/EmailConfirmationModal.tsx";
import { Modal } from "@components/modal/modal";
import styles from "./Register.module.css";

import arrowLeftIcon from "@icons/arrow-left.svg";
import alreadyHaveAccountIcon from "@icons/already-have-account.svg";

const Register = () => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [usernameError, setUsernameError] = useState(false);
	const [emailError, setEmailError] = useState(false);
	const [passwordError, setPasswordError] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
	const [modalMessage, setModalMessage] = useState("");

	const authStore = useAuthStore();
	const location = useLocation();

	useEffect(() => {
		const errorMessage = location.query?.["error"];

		if (errorMessage) {
			switch (errorMessage) {
				case "email-confirmation-failed":
					setModalMessage("Email confirmation failed. Please try again.");
					break;
				case "invalid-code":
					setModalMessage("The verification code is invalid. Please try again.");
					break;
				default:
					setModalMessage("An unknown error occurred.");
					break;
			}
			setIsErrorModalOpen(true);
		}
	}, [location.query]);

	const validateInputs = (): boolean => {
		let isValid = true;

		if (!username.trim()) {
			setUsernameError(true);
			isValid = false;
		} else {
			setUsernameError(false);
		}

		if (!email.trim()) {
			setEmailError(true);
			isValid = false;
		} else {
			setEmailError(false);
		}

		if (!password.trim()) {
			setPasswordError(true);
			isValid = false;
		} else {
			setPasswordError(false);
		}

		return isValid;
	};

	const handleRegister = async (e: Event) => {
		e.preventDefault();

		if (!validateInputs()) return;

		const { accessToken } = await api.register({ username, email, password });

		if (accessToken) {
			authStore.login(accessToken);
			setIsModalOpen(true);
		} else {
			alert("Invalid data");
		}
	};

	const handleVerifyEmail = async (code: string) => {
		try {
			await api.verifyEmail(code);
			setIsModalOpen(false);
			location.route("/");
		} catch (error) {
			console.error(error);
		}
	};

	const handleResendEmail = async () => {
		try {
			await api.resendEmail();
		} catch (error) {
			console.error(error);
		}
	};

	const handleUsernameInput = (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		setUsername(value);
		setUsernameError(value === "" && usernameError);
	};

	const handleEmailInput = (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		setEmail(value);
		setEmailError(value === "" && emailError);
	};

	const handlePasswordInput = (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		setPassword(value);
		setPasswordError(value === "" && passwordError);
	};

	return (
		<div className={styles["register-container"]}>
			{isErrorModalOpen && modalMessage && (
				<Modal
					title="Error"
					description={modalMessage}
					onClose={() => setIsErrorModalOpen(false)}
					actionButtons={[<Button onClick={() => setIsErrorModalOpen(false)} variant="primary" icon={arrowLeftIcon}>Close</Button>]}
				/>
			)}
			{isModalOpen && (
				<EmailConfirmationModal
					isOpen={isModalOpen}
					email={email}
					onClose={() => setIsModalOpen(false)}
					onVerify={handleVerifyEmail}
					onResendCode={handleResendEmail}
				/>
			)}
			<div className={styles["register-form"]}>
				<div className={styles["register-form-header"]}>
					<div className={styles["register-form-title"]}>
						<div className={styles["form"]}>
							<div className={styles["register-title"]}>Register</div>
							<div className={styles["form-register"]}>
								<div className={styles["register"]}>
									<label className={styles["register-label"]}>
										Username<span className={styles["required"]}>*</span>
									</label>
									<input
										type="text"
										className={`${styles["register-input"]} ${usernameError ? styles["input-error"] : ""}`}
										placeholder="floof_fox"
										value={username}
										onInput={handleUsernameInput}
										required
									/>
									<label className={styles["register-label"]}>
										Email<span className={styles["required"]}>*</span>
									</label>
									<input
										type="email"
										className={`${styles["register-input"]} ${emailError ? styles["input-error"] : ""}`}
										placeholder="floofer@coof.fox"
										value={email}
										onInput={handleEmailInput}
										required
									/>
									<label className={styles["register-label"]}>
										Password<span className={styles["required"]}>*</span>
									</label>
									<input
										type="password"
										className={`${styles["register-input"]} ${passwordError ? styles["input-error"] : ""}`}
										placeholder="your floof password :3"
										value={password}
										onInput={handlePasswordInput}
										required
									/>
								</div>
							</div>
						</div>
						<div className={styles["register-button"]}>
							<Button variant="primary" onClick={handleRegister} icon={arrowLeftIcon}>
								Register
							</Button>
						</div>
						<div className={styles["divider"]} />
						<div className={styles["social-buttons"]}>
							<Button variant="secondary" onClick={() => location.route("/auth/login")} icon={alreadyHaveAccountIcon}>
								Already have an account?
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Register;