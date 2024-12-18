import { useEffect, useState } from "preact/hooks";
import styles from "./EmailConfirmationModal.module.css";
import { Button } from "@components/base/buttons/Button";
import TimerIcon from "@icons/timer.svg";

interface EmailConfirmationModalProps {
    isOpen: boolean;
    email: string;
    onClose: () => void;
    onVerify: (code: string) => Promise<void>;
    onResendCode: () => Promise<void>;
    isLoading?: boolean;
}

export const EmailConfirmationModal = ({
                                           isOpen,
                                           email,
                                           onClose,
                                           onVerify,
                                           onResendCode,
                                           isLoading = false,
                                       }: EmailConfirmationModalProps) => {
    const [code, setCode] = useState<string[]>(Array(6).fill(""));
    const [isResendDisabled, setIsResendDisabled] = useState<boolean>(true);
    const [timer, setTimer] = useState<number>(60);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => { window.removeEventListener("keydown", handleKeyDown); };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            setIsResendDisabled(true);
            setTimer(60);
        }
    }, [isOpen]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isResendDisabled) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setIsResendDisabled(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { clearInterval(interval); };
    }, [isResendDisabled]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    const handleCodeChange = (e: Event, index: number) => {
        const inputElement = e.currentTarget as HTMLInputElement;
        const value = inputElement.value;

        if (/^\d$/.test(value)) {
            setCode((prev) => {
                const updatedCode = [...prev];
                updatedCode[index] = value;
                if (index < 5 && value) {
                    const nextInput = inputElement.nextElementSibling as HTMLInputElement | null;
                    if (nextInput) {
                        nextInput.focus();
                    }
                }
                return updatedCode;
            });
        } else {
            inputElement.value = "";
        }
    };

    const handleBackspace = (e: KeyboardEvent, index: number) => {
        const inputElement = e.currentTarget as HTMLInputElement;
        if (e.key === "Backspace") {
            if (!code[index] && index > 0) {
                setCode((prev) => {
                    const updatedCode = [...prev];
                    updatedCode[index - 1] = "";
                    return updatedCode;
                });
                const previousInput = inputElement.previousElementSibling as HTMLInputElement | null;
                if (previousInput) {
                    previousInput.focus();
                }
            } else if (code[index]) {
                setCode((prev) => {
                    const updatedCode = [...prev];
                    updatedCode[index] = "";
                    return updatedCode;
                });
            }
        }
    };

    const handleVerify = async () => {
        const fullCode = code.join("");
        if (fullCode.length === 6) {
            try {
                await onVerify(fullCode);
            } catch (error) {
                console.error("Verification failed:", error);
            }
        }
    };

    const handlePaste = (event: ClipboardEvent) => {
        event.preventDefault();
        const pastedText = event.clipboardData?.getData("text") || "";

        const sanitizedCode = pastedText.replace(/\D/g, "").slice(0, 6).split("");
        const paddedCode = [...sanitizedCode, ...Array(6 - sanitizedCode.length).fill("")];

        setCode(paddedCode);
    };

    const handleResendCode = async () => {
        setIsResendDisabled(true);
        setTimer(60);
        try {
            await onResendCode();
        } catch (error) {
            console.error("Resend failed:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`${styles["overlay"]} ${isOpen ? styles["visible"] : ""}`} onClick={onClose}>
            <div className={styles["modal"]} onClick={(e) => { e.stopPropagation(); }}>
                <h2 className={styles["title"]}>Check your email</h2>
                <p className={styles["description"]}>{email ?? "Failed to receive mail"}</p>
                <div className={styles["code-input-container"]}>
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            placeholder="0"
                            className={`${styles["code-input"]} ${styles["input-with-placeholder"]}`}
                            value={digit}
                            maxLength={1}
                            onInput={(e) => { handleCodeChange(e, index); }}
                            onPaste={handlePaste}
                            onKeyDown={(e) => { handleBackspace(e, index); }}
                        />
                    ))}
                </div>

                <div className={styles["actions"]}>
                    <Button
                        onClick={() => handleVerify().catch(console.error)}
                        variant="primary"
                        width={318}
                        disabled={isLoading || code.some((digit) => !digit)}
                    >
                        {isLoading ? "Checking..." : "Confirm"}
                    </Button>
                    <div className={styles["resend-text"]}>
                        {isResendDisabled ? (
                            <>
                                <span>Time until you can resend code</span>
                                <div className={styles["timer-container"]}>
                                    <span className={styles["timer"]}>{formatTime(timer)}</span>
                                    <img className={styles["timer-icon"]} src={TimerIcon} alt="Timer" />
                                </div>
                            </>
                        ) : (
                            <>
                                <span>Didn’t receive code?{" "}
                                    <a onClick={() => handleResendCode().catch(console.error)} className={styles["resend-link"]}>Send again</a>
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};