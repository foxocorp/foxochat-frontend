import {useLocation} from "preact-iso";
import {useState} from "preact/hooks";

import {api} from "../../services/api/authenticationService";
import {useAuthStore} from "../../store/authenticationStore";

import {Button} from "@components/base/buttons/Button"
import {Modal} from "@components/modal/modal";
import styles from "./SignUp.module.css";
import {AuthenticationActionButtons} from "@components/base/buttons/AuthenticationActionButtons";

const SignUp = () => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [usernameError, setUsernameError] = useState(false);
	const [emailError, setEmailError] = useState(false);
	const [passwordError, setPasswordError] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalMessage, setModalMessage] = useState("");

	const authStore = useAuthStore();
	const location = useLocation();

	const handleSignUp = async (e: Event) => {
		e.preventDefault();

		setUsernameError(username === "");
		setEmailError(email === "");
		setPasswordError(password === "");

		if (username === "" || email === "" || password === "") return;

		try {
			const response = await api.register(username, email, password);
			if (response && response.accessToken) {
				authStore.login(response.accessToken);
				location.route("/");
			} else {
				setModalMessage("Data hui");
				setIsModalOpen(true);
			}
		} catch (error) {
			console.error(error);
			setModalMessage("Code is invalid!\nYou can press button bellow to send new code.");
			setIsModalOpen(true);
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

	const goToLogin = () => {
		location.route("/auth/login");
	};

	const socialButtons = [
		{icon: "/src/assets/svg/google.svg", label: "Google", action: () => alert("Google")},
		{icon: "/src/assets/svg/discord.svg", label: "Discord", action: () => alert("Discord")},
		{icon: "/src/assets/svg/telegram.svg", label: "Telegram", action: () => alert("Telegram")},
		{icon: "/src/assets/svg/github.svg", label: "GitHub", action: () => alert("GitHub")},
		{icon: "/src/assets/svg/meta.svg", label: "Meta", action: () => alert("Meta")},
		{icon: "/src/assets/svg/apple.svg", label: "Apple", action: () => alert("Apple")},
	];

	return (
		<div className={styles["signUp-container"]}>
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
			<div className={styles["signUp-form"]}>
				<div className={styles["signUp-form-header"]}>
					<div className={styles["signUp-form-title"]}>
						<div className={styles.form}>
							<div className={styles["signUp-title"]}>Sign up</div>
							<div className={styles["form-signUp"]}>
								<div className={styles.signUp}>
									<label className={styles["signUp-label"]}>
										Username<span className={styles["required"]}>*</span>
									</label>
									<input
										type="text"
										className={`${styles["signUp-input"]} ${
											usernameError ? styles["input-error"] : ""
										}`}
										placeholder="floof_fox"
										value={username}
										onInput={handleUsernameInput}
										required
									/>
									<label className={styles["signUp-label"]}>
										Email<span className={styles["required"]}>*</span>
									</label>
									<input
										type="email"
										className={`${styles["signUp-input"]} ${
											emailError ? styles["input-error"] : ""
										}`}
										placeholder="floofer@coof.fox"
										value={email}
										onInput={handleEmailInput}
										required
									/>
									<label className={styles["signUp-label"]}>
										Password<span className={styles["required"]}>*</span>
									</label>
									<input
										type="password"
										className={`${styles["signUp-input"]} ${
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
						<div className={styles["signUp-button"]}>
							<form onSubmit={handleSignUp}>
								<button type="submit" className={styles.button}>
									<span>Register</span>
									<img src="/src/assets/svg/arrow-left.svg" alt="arrow left"/>
								</button>
							</form>
						</div>
						<div className={styles.divider}></div>
						<AuthenticationActionButtons buttons={socialButtons}/>
						<div className={styles.divider}></div>
						<div className={styles["another-signUp-buttons"]}>
							<button onClick={goToLogin} className={styles["reset-password-button"]}>
								Already have an account?
								<img
									src="/src/assets/svg/already-have-account.svg"
									alt="already have account"
								/>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignUp;
