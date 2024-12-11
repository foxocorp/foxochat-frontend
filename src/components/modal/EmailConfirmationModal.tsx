import { useState, useEffect } from "preact/hooks";
import styles from "./EmailConfirmationModal.module.css";
import { Button } from "@components/base/buttons/Button";

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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

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

    const handleFocus = (e: FocusEvent) => {
        const inputElement = e.currentTarget as HTMLInputElement;
        inputElement.setSelectionRange(1, 1);
    };

    const handleVerify = async () => {
        const fullCode = code.join("");
        if (fullCode.length === 6) {
            await onVerify(fullCode);
        }
    };

    const handlePaste = (event: ClipboardEvent) => {
        event.preventDefault();
        const pastedText = event.clipboardData?.getData("text") || "";

        const sanitizedCode = pastedText.replace(/\D/g, "").slice(0, 6).split("");
        const paddedCode = [...sanitizedCode, ...Array(6 - sanitizedCode.length).fill("")];

        setCode(paddedCode);
    };

    if (!isOpen) return null;

    return (
        <div className={`${styles["overlay"]} ${isOpen ? styles["visible"] : ""}`} onClick={onClose}>
            <div className={styles["modal"]} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles["title"]}>Check your email</h2>
                <p className={styles["description"]}>{email}</p>
                <div className={styles["codeInputContainer"]}>
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            placeholder="0"
                            className={`${styles["codeInput"]} ${styles["input-with-placeholder"]}`}
                            value={digit}
                            maxLength={1}
                            onInput={(e) => handleCodeChange(e, index)}
                            onPaste={handlePaste}
                            onKeyDown={(e) => handleBackspace(e, index)}
                            onFocus={handleFocus} />
                    ))}
                </div>

                <div className={styles["actions"]}>
                    <Button
                        onClick={handleVerify}
                        variant="primary"
                        width={315}
                        disabled={isLoading || code.some((digit) => !digit)}>
                        {isLoading ? "Checking..." : "Confirm"}
                    </Button>
                    <p className={styles["resend-text"]}>
                        Didn’t receive code?{" "}
                        <span onClick={onResendCode} className={`${styles["resend-link"]} ${styles["underline"]}`}>
                            Send again
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};
