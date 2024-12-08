import { useState } from "preact/hooks";
import { Button } from "@components/base/buttons/Button";
import { AuthenticationActionButtons } from "@components/base/buttons/AuthenticationActionButtons";
import { api } from "../../services/api/authenticationService";
import { useAuthStore } from "../../store/authenticationStore";
import { useLocation } from "preact-iso";
import Loading from "@components/LoadingApp";
import styles from "./LogIn.module.css";
import { getSocialButtons } from "../../utils/socialButtons";

const logIn = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [emailError, setEmailError] = useState(false);
	const [passwordError, setPasswordError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const authStore = useAuthStore();
	const location = useLocation();
	const buttons = getSocialButtons();

	const handleLogIn = async (e: Event) => {
		e.preventDefault();

		setEmailError(false);
		setPasswordError(false);

		if (!email) setEmailError(true);
		if (!password) setPasswordError(true);
		if (!email || !password) return;

		setIsLoading(true);

		try {
			const response = await api.login(email, password);
			if (response?.accessToken) {
				authStore.login(response.accessToken);
				alert("Successful login");
			} else {
				alert("Login error. Try again");
			}
		} catch (error) {
			console.error("Error during login:", error);
			const errorMessage = error instanceof Error ? error.message : "Unknown error";
			alert(`Error: ${errorMessage}`);
		} finally {
			setIsLoading(false);
		}
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

	const goToResetPassword = () => {
		location.route("/auth/reset-password");
	};

	const goToCreateAccount = () => {
		location.route("/auth/register");
	};

	return (
		<div className={styles["logIn-container"]}>
			{isLoading && <Loading/>}
			<div className={styles["logIn-form"]}>
				<div className={styles["logIn-form-header"]}>
					<div className={styles["logIn-form-title"]}>
						<div className={styles["form"]}>
							<div className={styles["logIn-title"]}>Log in</div>
							<div className={styles["form-logIn"]}>
								<div className={styles["logIn"]}>
									<label className={styles["logIn-label"]}>Email<span
										className={styles["required"]}>*</span></label>
									<input
										type="email"
										className={`${styles["logIn-input"]} ${emailError ? styles["input-error"] : ""}`}
										placeholder="floofer@coof.fox"
										value={email}
										onInput={handleEmailInput}
										required
									/>
									<label className={styles["logIn-label"]}>Password<span
										className={styles["required"]}>*</span></label>
									<input
										type="password"
										className={`${styles["logIn-input"]} ${passwordError ? styles["input-error"] : ""}`}
										placeholder="your floof password :3"
										value={password}
										onInput={handlePasswordInput}
										required
									/>
								</div>
							</div>
						</div>
						<div className={styles["logIn-button"]}>
							<form onSubmit={handleLogIn}>
								<Button variant="primary">
									Log in
									<img src="/src/assets/svg/arrow-left.svg" alt="arrow left"/>
								</Button>
							</form>
						</div>
						<div className={styles["divider"]}></div>
						<AuthenticationActionButtons buttons={buttons}/>
						<div className={styles["divider"]}></div>
						<div className={styles["social-buttons"]}>
							<Button variant="secondary" onClick={goToResetPassword}>
								Reset your password
								<img src="/src/assets/svg/reset-password.svg" alt="reset password"/>
							</Button>
							<Button variant="secondary" onClick={goToCreateAccount}>
								Create new account
								<img src="/src/assets/svg/new-user.svg" alt="create new account"/>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default logIn;
