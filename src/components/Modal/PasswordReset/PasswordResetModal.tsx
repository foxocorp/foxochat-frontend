import { Button } from "@components/Base/Buttons/Button";
import TimerIcon from "@icons/timer.svg";
import { APIOk } from "foxogram.js";
import { usePasswordReset } from "./PasswordReset";
import * as style from "./PasswordResetModal.module.scss";

interface PasswordResetModalProps {
	isOpen: boolean;
	email: string;
	onClose: () => void;
	onSendEmail: (email: string) => Promise<APIOk>;
	onVerifyCode: (code: string) => Promise<APIOk>;
	onResetPassword: (password: string) => Promise<APIOk | undefined>;
	onResendCode: () => Promise<APIOk>;
}

export const PasswordResetModal = ({
	isOpen,
	email,
	onClose,
	onSendEmail,
	onVerifyCode,
	onResetPassword,
	onResendCode,
}: PasswordResetModalProps) => {
	const {
		state,
		setState,
		handleSendEmail,
		handleInputChange,
		handleKeyDown,
		handleVerifyCode,
		handleResendCode,
		handleResetPassword,
		formatTime,
	} = usePasswordReset(
		email,
		onSendEmail,
		onVerifyCode,
		onResetPassword,
		onResendCode,
	);

	if (!isOpen) return null;

	return (
		<div
			className={`${style.overlay} ${isOpen ? style.visible : ""}`}
			onClick={onClose}
		>
			<div
				className={style.modal}
				onClick={(e) => {
					e.stopPropagation();
				}}
			>
				{state.step === 1 && (
					<>
						<h2 className={style.title}>Reset password</h2>
						<p className={style.description}>
							Type your email to reset password
						</p>
						<input
							type="email"
							value={state.emailInput}
							onInput={(e) => {
								setState((prev) => ({
									...prev,
									emailInput: e.currentTarget.value,
								}));
							}}
							placeholder="fox@foxmail.fox"
							className={style.easyInput}
						/>
						{state.errorMessage && (
							<div className={style.line}>{state.errorMessage}</div>
						)}
						<div className={style.actions}>
							<Button
								onClick={handleSendEmail}
								variant="primary"
								width={318}
								fontWeight={600}
								disabled={!state.emailInput}
							>
								Confirm
							</Button>
						</div>
					</>
				)}

				{state.step === 2 && (
					<>
						<h2 className={style.title}>Check your email</h2>
						<p className={style.description}>
							{email ?? "Failed to receive mail"}
						</p>
						<div className={style.easyInputContainer}>
							{state.code.map((digit, index) => (
								<input
									key={index}
									placeholder="0"
									className={`${style.codeInput} ${state.errorMessage ? style.error : ""}`}
									value={digit}
									maxLength={1}
									onInput={(e) => {
										handleInputChange(e, index);
									}}
									onKeyDown={(e) => {
										handleKeyDown(e, index);
									}}
								/>
							))}
						</div>
						{state.errorMessage && (
							<div className={style.line}>{state.errorMessage}</div>
						)}
						<div className={style.actions}>
							<Button
								onClick={handleVerifyCode}
								variant="primary"
								width={318}
								fontWeight={600}
								disabled={state.code.some((digit) => !digit)}
							>
								Verify Code
							</Button>
							<div className={style.resendText}>
								{state.isResendDisabled ? (
									<>
										<span>Time until you can resend code</span>
										<div className={style.timerContainer}>
											<span className={style.timer}>
												{formatTime(state.timer)}
											</span>
											<img
												className={style.timerIcon}
												src={TimerIcon}
												alt="Timer"
											/>
										</div>
									</>
								) : (
									<span>
										Didn’t receive code?{" "}
										<a onClick={handleResendCode} className={style.resendLink}>
											Send again
										</a>
									</span>
								)}
							</div>
						</div>
					</>
				)}

				{state.step === 3 && (
					<>
						<h2 className={style.title}>Enter new password</h2>
						<p className={style.description}>
							This will replace your old password
						</p>
						<input
							type="password"
							value={state.password}
							onInput={(e) => {
								setState((prev) => ({
									...prev,
									password: e.currentTarget.value,
								}));
							}}
							placeholder="New password"
							className={style.easyInput}
							maxLength={128}
						/>
						{state.errorMessage && (
							<div className={style.line}>{state.errorMessage}</div>
						)}
						<div className={style.actions}>
							<Button
								onClick={handleResetPassword}
								variant="primary"
								width={318}
								fontWeight={600}
								disabled={
									state.password.length < 8 || state.password.length > 128
								}
							>
								Confirm
							</Button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};
