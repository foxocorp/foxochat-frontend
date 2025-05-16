import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import React from "react";

interface CodeVerificationState {
    code: string[];
    errorMessage: string;
    isResendDisabled: boolean;
    timer: number;
}

interface UseCodeVerificationProps {
    initialTime?: number;
    codeLength?: number;
    onVerify: () => Promise<void>;
    onResendCode: () => Promise<void>;
}

export const useCodeVerification = ({
                                        initialTime = 60,
                                        codeLength = 6,
                                        onVerify,
                                        onResendCode,
                                    }: UseCodeVerificationProps) => {
    const [state, setState] = useState<CodeVerificationState>({
        code: new Array<string>(codeLength).fill(""),
        errorMessage: "",
        isResendDisabled: true,
        timer: initialTime,
    });

    const timerRef = useRef<number>(initialTime);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        timerRef.current = initialTime;
        setState((prev) => ({ ...prev, timer: timerRef.current, isResendDisabled: true }));

        intervalRef.current = setInterval(() => {
            if (timerRef.current <= 1) {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
                setState((prev) => ({ ...prev, isResendDisabled: false, timer: 0 }));
                timerRef.current = 0;
            } else {
                timerRef.current -= 1;
                setState((prev) => ({ ...prev, timer: timerRef.current }));
            }
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const handleInputChange = (e: React.FormEvent<HTMLInputElement>, index: number) => {
        const inputElement = e.currentTarget;
        const value = inputElement.value;

        if (/^\d$/.test(value)) {
            setState((prev) => {
                const updatedCode = [...prev.code];
                updatedCode[index] = value;
                if (index < codeLength - 1 && value) {
                    const nextInput = inputElement.nextElementSibling as HTMLInputElement | null;
                    if (nextInput) nextInput.focus();
                }
                return { ...prev, code: updatedCode, errorMessage: "" };
            });
        } else if (value === "") {
            setState((prev) => {
                const updatedCode = [...prev.code];
                updatedCode[index] = "";
                return { ...prev, code: updatedCode, errorMessage: "" };
            });
        } else {
            inputElement.value = "";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault();
            setState((prev) => {
                const updatedCode = [...prev.code];
                updatedCode[index] = "";
                if (e.key === "Backspace" && index > 0 && !updatedCode[index]) {
                    const previousInput = e.currentTarget.previousElementSibling as HTMLInputElement | null;
                    if (previousInput) previousInput.focus();
                }
                return { ...prev, code: updatedCode, errorMessage: "" };
            });
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData?.getData("text") ?? "";
        if (pastedText.trim() === "") return;
        const sanitizedCode = pastedText.replace(/\D/g, "").slice(0, codeLength).split("");
        const paddedCode = sanitizedCode.concat(new Array(codeLength - sanitizedCode.length).fill(""));

        setState((prev) => ({ ...prev, code: paddedCode, errorMessage: "" }));
    };

    const handleVerify = useCallback(async () => {
        const fullCode = state.code.join("");
        if (fullCode.length === codeLength && state.code.every((digit) => digit !== "")) {
            try {
                await onVerify(fullCode);
                setState((prev) => ({ ...prev, errorMessage: "" }));
            } catch (error) {
                setState((prev) => ({ ...prev, errorMessage: "Code is invalid" }));
            }
        } else {
            setState((prev) => ({ ...prev, errorMessage: "Code is invalid" }));
        }
    }, [state.code, onVerify, codeLength]);

    const handleResendCode = useCallback(async () => {
        try {
            await onResendCode();
            timerRef.current = initialTime;
            setState((prev) => ({
                ...prev,
                timer: timerRef.current,
                isResendDisabled: true,
                errorMessage: "",
            }));
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = setInterval(() => {
                if (timerRef.current <= 1) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                    }
                    setState((prev) => ({ ...prev, isResendDisabled: false, timer: 0 }));
                    timerRef.current = 0;
                } else {
                    timerRef.current -= 1;
                    setState((prev) => ({ ...prev, timer: timerRef.current }));
                }
            }, 1000);
        } catch (error) {
            setState((prev) => ({ ...prev, errorMessage: "Failed to resend code" }));
        }
    }, [onResendCode, initialTime]);

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    return {
        state,
        setState,
        handleInputChange,
        handleKeyDown,
        handlePaste,
        handleVerify,
        handleResendCode,
        formatTime,
    };
};