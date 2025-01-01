import { Button } from "@components/base/buttons/Button";
import { useEffect, useState, useCallback, useRef } from "preact/hooks";
import styles from "./PasswordResetModal.module.css";
import TimerIcon from "@icons/timer.svg";

type Step = 1 | 2 | 3;

interface PasswordResetModalProps {
    isOpen: boolean;
    email: string;
    onClose: () => void;
    onSendEmail: (email: string) => Promise<void>;
    onVerifyCode: (code: string) => Promise<void>;
    onResetPassword: (password: string) => Promise<void>;
    onResendCode: () => Promise<void>;
    isLoading?: boolean;
}

interface PasswordResetState {
    step: Step;
    emailInput: string;
    code: string[];
    password: string;
    errorMessage: string;
    isResendDisabled: boolean;
    timer: number;
}

export const PasswordResetModal = ({
                                       isOpen,
                                       email,
                                       onClose,
                                       onSendEmail,
                                       onVerifyCode,
                                       onResetPassword,
                                       isLoading = false,
                                   }: PasswordResetModalProps) => {
    const [state, setState] = useState<PasswordResetState>({
        step: 1,
        emailInput: email,
        code: Array(6).fill(""),
        password: "",
        errorMessage: "",
        isResendDisabled: true,
        timer: 60,
    });

    const timerRef = useRef<number>(60);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isOpen) {
            setState({
                step: 1,
                emailInput: email,
                code: Array(6).fill(""),
                password: "",
                errorMessage: "",
                isResendDisabled: true,
                timer: 60,
            });
        }
    }, [isOpen, email]);

    useEffect(() => {
        if (state.isResendDisabled) {
            intervalRef.current = setInterval(() => {
                if (timerRef.current <= 1) {
                    clearInterval(intervalRef.current!);
                    setState((prev) => ({ ...prev, isResendDisabled: false, timer: 0 }));
                    timerRef.current = 0;
                } else {
                    timerRef.current -= 1;
                    setState((prev) => ({ ...prev, timer: timerRef.current }));
                }
            }, 1000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [state.isResendDisabled]);

    const handleCodeChange = (e: React.FormEvent<HTMLInputElement>, index: number) => {
        const inputElement = e.currentTarget;
        const value = inputElement.value;

        if (/^\d$/.test(value)) {
            setState((prev) => {
                const updatedCode = [...prev.code];
                updatedCode[index] = value;
                if (index < 5 && value) {
                    const nextInput = inputElement.nextElementSibling as HTMLInputElement | null;
                    if (nextInput) {
                        nextInput.focus();
                    }
                }
                return { ...prev, code: updatedCode };
            });
        } else {
            inputElement.value = "";
        }
    };

    const handleSendEmail = useCallback(async () => {
        const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(state.emailInput);
        if (!isValidEmail) {
            setState((prev) => ({ ...prev, errorMessage: "Invalid email address" }));
            return;
        }

        try {
            await onSendEmail(state.emailInput);
            setState((prev) => ({ ...prev, step: 2 }));
        } catch (error) {
            setState((prev) => ({ ...prev, errorMessage: "Failed to send email. Please try again." }));
        }
    }, [state.emailInput, onSendEmail]);

    const handleVerifyCode = useCallback(async () => {
        const fullCode = state.code.join("");
        if (fullCode.length === 6) {
            try {
                await onVerifyCode(fullCode);
                setState((prev) => ({ ...prev, step: 3 }));
            } catch (error) {
                setState((prev) => ({ ...prev, errorMessage: "Invalid verification code. Please try again." }));
            }
        }
    }, [state.code, onVerifyCode]);

    const handleResetPassword = useCallback(async () => {
        if (state.password.length >= 8 && state.password.length <= 128) {
            try {
                await onResetPassword(state.password);
                window.location.href = "/auth/login";
            } catch (error) {
                setState((prev) => ({ ...prev, errorMessage: "Failed to reset password. Please try again." }));
            }
        } else {
            setState((prev) => ({ ...prev, errorMessage: "Password must be between 8 and 128 characters." }));
        }
    }, [state.password, onResetPassword]);

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    if (!isOpen) return null;

    return (
        <div className={`${styles["overlay"]} ${isOpen ? styles["visible"] : ""}`} onClick={onClose}>
            <div className={styles["modal"]} onClick={(e) => e.stopPropagation()}>
                {state.step === 1 && (
                    <>
                        <h2 className={styles["title"]}>Reset password</h2>
                        <p className={styles["description"]}>{"Type your email to reset password"}</p>
                        <input
                            type="email"
                            value={state.emailInput}
                            onInput={(e) => setState((prev) => ({ ...prev, emailInput: e.currentTarget.value }))}
                            placeholder="fox@foxmail.fox"
                            className={styles["easy-input"]}
                        />
                        {state.errorMessage && <div className={styles["error-message"]}>{state.errorMessage}</div>}
                        <div className={styles["actions"]}>
                            <Button onClick={handleSendEmail} variant="primary" width={318} disabled={isLoading || !state.emailInput}>
                                {isLoading ? "Loading..." : "Confirm"}
                            </Button>
                        </div>
                    </>
                )}

                {state.step === 2 && (
                    <>
                        <h2 className={styles["title"]}>Check your email</h2>
                        <p className={styles["description"]}>{email ?? "Failed to receive mail"}</p>
                        <div className={styles["easy-input-container"]}>
                            {state.code.map((digit, index) => (
                                <input
                                    key={index}
                                    placeholder="0"
                                    className={`${styles["code-input"]} ${styles["input-with-placeholder"]}`}
                                    value={digit}
                                    maxLength={1}
                                    onInput={(e) => handleCodeChange(e, index)}
                                />
                            ))}
                        </div>
                        {state.errorMessage && <div className={styles["error-message"]}>{state.errorMessage}</div>}
                        <div className={styles["actions"]}>
                            <Button onClick={handleVerifyCode} variant="primary" width={318} disabled={isLoading || state.code.some((digit) => !digit)}>
                                {isLoading ? "Verifying..." : "Verify Code"}
                            </Button>
                        </div>
                        <div className={styles["resend-text"]}>
                            {state.isResendDisabled ? (
                                <>
                                    <span>Time until you can resend code</span>
                                    <div className={styles["timer-container"]}>
                                        <span className={styles["timer"]}>{formatTime(state.timer)}</span>
                                        <img className={styles["timer-icon"]} src={TimerIcon} alt="Timer" />
                                    </div>
                                </>
                            ) : (
                                <span>Didn’t receive code? Continue</span>
                            )}
                        </div>
                    </>
                )}

                {state.step === 3 && (
                    <>
                        <h2 className={styles["title"]}>Enter new password</h2>
                        <p className={styles["description"]}>{"This will replace your old password"}</p>
                        <input
                            type="password"
                            value={state.password}
                            onInput={(e) => setState((prev) => ({ ...prev, password: e.currentTarget.value }))}
                            placeholder="New password"
                            className={styles["easy-input"]}
                            maxLength={128}
                        />
                        {state.errorMessage && <div className={styles["error-message"]}>{state.errorMessage}</div>}
                        <div className={styles["actions"]}>
                            <Button onClick={handleResetPassword} variant="primary" width={318} disabled={isLoading || state.password.length < 8 || state.password.length > 128}>
                                {isLoading ? "Resetting..." : "Confirm"}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
