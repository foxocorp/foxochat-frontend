import { Button } from "@components/Base/Buttons/Button";
import { useCodeVerification } from "@hooks/useCodeVerification";
import { useEffect, useState } from "preact/hooks";
import React from "react";

import TimerIcon from "@/assets/icons/auth/auth-reset-password-timer.svg";
import * as style from "./EmailConfirmationModal.module.scss";

interface EmailConfirmationModalProps {
	isOpen: boolean;
	email: string;
	onClose: () => void;
	onVerify: (code: string) => Promise<void>;
	onResendCode: () => Promise<void>;
}

export const EmailConfirmationModal = ({
	isOpen,
	email,
	onClose,
	onVerify,
	onResendCode,
}: EmailConfirmationModalProps) => {
	const {
		state,
		handleInputChange,
		handleKeyDown,
		handlePaste,
		handleVerify,
		handleResendCode,
		formatTime,
	} = useCodeVerification({ onVerify, onResendCode });

	const [isErrorVisible, setIsErrorVisible] = useState(false);

	useEffect(() => {
		setIsErrorVisible(!!state.errorMessage);
	}, [state.errorMessage]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				onClose();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	const closeModal = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		onClose();
	};

	return (
		<div
			className={`${style.overlay} ${isOpen ? style.visible : ""}`}
			onClick={closeModal}
		>
			<div
				className={style.modal}
				onClick={(e) => {
					e.stopPropagation();
				}}
			>
				<h2 className={style.title}>Check your email</h2>
				<p className={style.description}>{email ?? "Failed to receive mail"}</p>
				<div className={`${style.codeInputContainer}`}>
					{state.code.map((digit, index) => (
						<input
							key={index}
							placeholder="0"
							className={`${style.codeInput} ${style.inputWithPlaceholder} ${style.error}`}
							value={digit}
							maxLength={1}
							onInput={(e) => {
								handleInputChange(e, index);
							}}
							onPaste={handlePaste}
							onKeyDown={(e) => {
								handleKeyDown(e, index);
							}}
						/>
					))}
				</div>
				{isErrorVisible && <div className={style.line}>Code is invalid</div>}
				<div className={style.actions}>
					<Button
						onClick={() =>
							handleVerify().catch(() => {
								setIsErrorVisible(true);
							})
						}
						variant="primary"
						width={318}
						fontWeight={600}
						disabled={state.code.some((digit) => !digit)}
					>
						Confirm
					</Button>
					<div className={style.resendText}>
						{state.isResendDisabled ? (
							<>
								<span>Time until you can resend code</span>
								<div className={style.timerContainer}>
									<span className={style.timer}>{formatTime(state.timer)}</span>
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
								<a
									onClick={() =>
										handleResendCode().catch(() => {
											setIsErrorVisible(true);
										})
									}
									className={style.resendLink}
								>
									Send again
								</a>
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
