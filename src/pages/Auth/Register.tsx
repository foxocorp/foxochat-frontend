import { useLocation } from "preact-iso";
import { useState } from "preact/hooks";

import { api } from "../../services/api/authenticationService";
import { useAuthStore } from "../../store/authenticationStore";

import styles from "./Register.module.css";

import arrowLeftIcon from "../../assets/svg/arrow-left.svg";
import alreadyHaveAccountIcon from "../../assets/svg/already-have-account.svg";
import { Button } from "@components/base";

const Register = () => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [usernameError, setUsernameError] = useState(false);
	const [emailError, setEmailError] = useState(false);
	const [passwordError, setPasswordError] = useState(false);

	const authStore = useAuthStore();
	const location = useLocation();

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

		try {
			const response = await api.register({ username, email, password });
			if (response.accessToken) {
				authStore.login(response.accessToken);
				alert("Successful registration");
				location.route("/");

			} else {
				alert("Invalid registration data. Please try again");
			}
		} catch (error) {
			console.error("Error during registration:", error);
			alert("An error occurred. Please try again later");
		}
	};
	const handleUsernameInput = (e: Event) => {
		const value = (e.target as HTMLInputElement).value.trim();
		setUsername(value);
		setUsernameError(value === "" && usernameError);
	};

	const handleEmailInput = (e: Event) => {
		const value = (e.target as HTMLInputElement).value.trim();
		setEmail(value);
		setEmailError(value === "" && emailError);
	};

	const handlePasswordInput = (e: Event) => {
		const value = (e.target as HTMLInputElement).value.trim();
		setPassword(value);
		setPasswordError(value === "" && passwordError);
	};

	const goToLogin = () => {
		location.route("/auth/login");
	};

	return (
		<div className={styles["register-container"]}>
			{/*{isModalOpen && (*/}
			{/*	<Modal*/}
			{/*		title="Oops!"*/}
			{/*		description={modalMessage}*/}
			{/*		onClose={() => setIsModalOpen(false)}*/}
			{/*		actionButtons={[*/}
			{/*			<Button*/}
			{/*				key="close"*/}
			{/*				onClick={() => setIsModalOpen(false)}*/}
			{/*				width={400}*/}
			{/*				variant="primary"*/}
			{/*				icon="/src/assets/svg/arrow-left.svg"*/}
			{/*			>*/}
			{/*				Send again*/}
			{/*			</Button>,*/}
			{/*		]}*/}
			{/*	/>*/}
			{/*)}*/}
			<div className={styles["register-form"]}>
				<div className={styles["register-form-header"]}>
					<div className={styles["register-form-title"]}>
						<div className={styles["form"]}>
							<div className={styles["register-title"]}>Sign up</div>
							<div className={styles["form-register"]}>
								<div className={styles["register"]}>
									<label className={styles["register-label"]}>
										Username<span className={styles["required"]}>*</span>
									</label>
									<input
										type="text"
										className={`${styles["register-input"]} ${
											usernameError ? styles["input-error"] : ""
										}`}
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
										className={`${styles["register-input"]} ${
											emailError ? styles["input-error"] : ""
										}`}
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
										className={`${styles["register-input"]} ${
											passwordError ? styles["input-error"] : ""
										}`}
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
						<div className={styles["divider"]}></div>
						<div className={styles["social-buttons"]}>
							<Button variant="secondary" onClick={goToLogin} icon={alreadyHaveAccountIcon}>
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
