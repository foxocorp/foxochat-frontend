import { Button } from "@components/Base";
import { PasswordResetModal } from "@components/Modal/PasswordReset/PasswordResetModal";
import { apiMethods } from "@services/API/apiMethods";
import { useAuthStore } from "@store/authenticationStore";
import { Logger } from "@utils/logger";
import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import arrowRightIcon from "@/assets/icons/auth/auth-arrow-right.svg";
import Illustration from "@/assets/icons/auth/illustration.png";
import { usePageTransitionContext } from "@/contexts/PageTransitionContext";
import * as styles from "./Login.module.scss";
import { useIsMobile } from "@/hooks/useIsMobile";

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
	const [isAnimating, setIsAnimating] = useState<boolean>(false);

	const authStore = useAuthStore();
	const location = useLocation();
	const { isTransitioning, startTransition } = usePageTransitionContext();
	const isMobile = useIsMobile();

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

	const handleNavigateToRegister = (): void => {
		startTransition("/register");
	};

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
			if (exception?.message) {
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
		const errorMessages = {
			email: emailErrorMessage,
			password: passwordErrorMessage,
		};
		return (
			<span className={styles.errorTextInline}>{errorMessages[field]}</span>
		);
	};

	return (
		<div className={styles.loginPageWrapper}>
			<div className={styles.loginLeftCol}>
				<div
					className={`${styles.loginContainer} ${isAnimating ? styles.animateIn : ""} ${isTransitioning ? styles.animateOut : ""}`}
				>
					<form className={styles.loginForm} onKeyDown={handleKeyDown}>
						<div className={styles.loginTitle}>Welcome back</div>
						<div className={styles.loginSubtitle}>
							Enter your email address and password to access FoxoChat.
						</div>
						<div className={styles.loginFormContent}>
							<div className={styles.labelRow}>
								<label className={styles.loginLabel}>
									Email<span className={styles.required}>*</span>
								</label>
								{renderError("email")}
							</div>
							<input
								type="email"
								className={`${styles.loginInput} ${emailError ? styles.inputError : ""}`}
								placeholder="fox@foxochat.app"
								value={email}
								onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
								required
							/>
							<div className={styles.labelRow}>
								<label className={styles.loginLabel}>
									Password<span className={styles.required}>*</span>
								</label>
								{renderError("password")}
							</div>
							<input
								type="password"
								className={`${styles.loginInput} ${passwordError ? styles.inputError : ""}`}
								placeholder="Your password here"
								value={password}
								onInput={(e) =>
									setPassword((e.target as HTMLInputElement).value)
								}
								required
							/>
							<Button
								key="login-button"
								variant="branded"
								width={368}
								fontSize={16}
								fontWeight={600}
								onClick={handleLogin}
								icon={arrowRightIcon}
								className={styles.loginButton}
							>
								Continue
							</Button>
							{isMobile ? (
								<div className={styles.mobileLinksRow}>
									<Button
										className={styles.mobileLinkButton}
										variant="secondary"
										width={30}
										onClick={handleNavigateToRegister}
									>
										Sign in
									</Button>
									<Button
										className={styles.mobileLinkButton}
										variant="secondary"
										width={30}
										onClick={openPasswordResetModal}
									>
										Reset password
									</Button>
								</div>
							) : (
								<div className={styles.loginLinksRow}>
									<span>
										Doesn't have an account?{" "}
										<a onClick={handleNavigateToRegister}>Sign Up</a>
									</span>
									<span>
										Forgot your password?{" "}
										<a onClick={openPasswordResetModal}>Reset</a>
									</span>
								</div>
							)}
							<div className={styles.dividerRow}>
								<span className={styles.dividerLine}></span>OR
								<span className={styles.dividerLine}></span>
							</div>
							<div className={styles.socialButtons}>
								<Button className={styles.socialButton} width={368}>
									Sign in with Telegram
								</Button>
								<Button className={styles.socialButton} width={368}>
									Sign in with Discord
								</Button>
							</div>
						</div>
					</form>
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
			<div className={styles.loginRightCol}>
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

export default Login;
