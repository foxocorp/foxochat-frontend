import { Button } from "@components/Base/Buttons/Button";
import type { APIOk } from "foxochat.js";
import arrowRightIcon from "@/assets/icons/auth/auth-arrow-right.svg";
import TimerIcon from "@/assets/icons/auth/auth-reset-password-timer.svg?react";
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
							Enter your email to get verification code
						</p>
						<label className={style.label} htmlFor="reset-email">
							Email <span className={style.required}>*</span>
						</label>
						<input
							id="reset-email"
							type="email"
							value={state.emailInput}
							onInput={(e) => {
								setState((prev) => ({
									...prev,
									emailInput: e.currentTarget.value,
								}));
							}}
							placeholder="Your email here"
							className={style.easyInput}
						/>
						{state.errorMessage && (
							<div className={style.line}>{state.errorMessage}</div>
						)}
						<div className={style.actions}>
							<Button
								onClick={handleSendEmail}
								variant="branded"
								icon={arrowRightIcon}
								width={327}
								fontWeight={600}
								disabled={!state.emailInput}
							>
								Continue
							</Button>
						</div>
					</>
				)}

				{state.step === 2 && (
					<>
						<h2 className={style.title}>Veirfy</h2>
						<p className={style.description}>
							Enter code bellow to confirm password reset{" "}
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
								variant="branded"
								icon={arrowRightIcon}
								width={327}
								fontWeight={600}
								disabled={state.code.some((digit) => !digit)}
							>
								Verify Code
							</Button>
							<div className={style.resendText}>
								{state.isResendDisabled ? (
									<>
										<span>You can request new code in...</span>
										<div className={style.timerContainer}>
											<span className={style.timer}>
												{formatTime(state.timer)}
											</span>
											<TimerIcon className={style.timerIcon} />
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
						<h2 className={style.title}>Your new password</h2>
						<p className={style.description}>
						Enter your new password to return access to your account
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
								variant="branded"
								icon={arrowRightIcon}
								width={327}
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
