import { useState } from "preact/hooks";
import { Button } from "@components/base/buttons/Button";
import { api } from "@services/api/authenticationService.ts";
import { useAuthStore } from "@store/authenticationStore.ts";
import { useLocation } from "preact-iso";
import Loading from "@components/LoadingApp";
import styles from "./Login.module.css";
import arrowLeftIcon from "@icons/arrow-left.svg";
import resetPasswordIcon from "@icons/reset-password.svg";
import newUserIcon from "@icons/new-user.svg";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [emailError, setEmailError] = useState(false);
	const [passwordError, setPasswordError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const authStore = useAuthStore();
	const location = useLocation();

	const handleLogin = async (e: Event): Promise<void> => {
		e.preventDefault();

		setEmailError(false);
		setPasswordError(false);

		if (!email) setEmailError(true);
		if (!password) setPasswordError(true);
		if (!email || !password) return;

		try {
			const response = await api.login({ email, password });
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
		} finally {
			setIsLoading(false);
		}
	};

	const handleEmailInput = (e: Event): void => {
		const value = (e.target as HTMLInputElement).value;
		setEmail(value);
		setEmailError(value === "" && emailError);
	};

	const handlePasswordInput = (e: Event): void => {
		const value = (e.target as HTMLInputElement).value;
		setPassword(value);
		setPasswordError(value === "" && passwordError);
	};

	return (
		<div className={styles["login-container"]}>
			{isLoading && <Loading />}
			<div className={styles["login-form"]}>
				<div className={styles["login-form-header"]}>
					<div className={styles["login-form-title"]}>
						<div className={styles["form"]}>
							<div className={styles["login-title"]}>Log in</div>
							<div className={styles["form-login"]}>
								<div className={styles["login"]}>
									<label className={styles["login-label"]}>Email<span
										className={styles["required"]}>*</span></label>
									<input
										type="email"
										className={`${styles["login-input"]} ${emailError ? styles["input-error"] : ""}`}
										placeholder="floofer@coof.fox"
										value={email}
										onInput={handleEmailInput}
										required
									/>
									<label className={styles["login-label"]}>Password<span
										className={styles["required"]}>*</span></label>
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
							<Button variant="secondary" onClick={() => { location.route("/auth/reset-password") }} icon={resetPasswordIcon}>
								Reset your password
							</Button>
							<Button variant="secondary" onClick={() => { location.route("/auth/register") }} icon={newUserIcon}>
								Create new account
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
