import { useState, useCallback } from "preact/hooks";
import { APIOk } from "@foxogram/api-types";
import { useLocation } from "preact-iso";
import { useCodeVerification } from "@hooks/useCodeVerification";

export interface PasswordResetState {
    step: 1 | 2 | 3;
    emailInput: string;
    password: string;
    errorMessage: string;
}

export const usePasswordReset = (
    email: string,
    onSendEmail: (email: string) => Promise<APIOk>,
    onVerifyCode: (code: string) => Promise<APIOk>,
    onResetPassword: (password: string) => Promise<APIOk | undefined>,
    onResendCode: () => Promise<APIOk>,
) => {
    const [state, setState] = useState<PasswordResetState>({
        step: 1,
        emailInput: email,
        password: "",
        errorMessage: "",
    });

    const location = useLocation();

    const {
        state: codeState,
        handleInputChange,
        handleKeyDown,
        handleVerify,
        handleResendCode,
        formatTime,
    } = useCodeVerification({
        onVerify: onVerifyCode,
        onResendCode,
    });

    const handleSendEmail = useCallback(async () => {
        const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(state.emailInput);
        if (!isValidEmail) {
            setState((prev) => ({ ...prev, errorMessage: "Invalid email format" }));
            return;
        }

        try {
            await onSendEmail(state.emailInput);
            setState((prev) => ({ ...prev, step: 2, errorMessage: "" }));
        } catch {
            setState((prev) => ({ ...prev, errorMessage: "Failed to send email" }));
        }
    }, [state.emailInput, onSendEmail]);

    const handleVerifyCode = useCallback(async () => {
        await handleVerify();
        if (!codeState.errorMessage) {
            setState((prev) => ({ ...prev, step: 3, errorMessage: "" }));
        } else {
            setState((prev) => ({ ...prev, errorMessage: codeState.errorMessage }));
        }
    }, [handleVerify, codeState.errorMessage]);

    const handleResetPassword = useCallback(async () => {
        if (state.password.length >= 8 && state.password.length <= 128) {
            try {
                await onResetPassword(state.password);
                location.route("/auth/login");
            } catch {
                setState((prev) => ({ ...prev, errorMessage: "Failed to reset password" }));
            }
        } else {
            setState((prev) => ({ ...prev, errorMessage: "Password must be 8-128 characters" }));
        }
    }, [state.password, onResetPassword, location]);

    return {
        state: {
            ...state,
            code: codeState.code,
            isResendDisabled: codeState.isResendDisabled,
            timer: codeState.timer,
        },
        setState,
        handleSendEmail,
        handleInputChange,
        handleKeyDown,
        handleVerifyCode,
        handleResendCode,
        handleResetPassword,
        formatTime,
    };
};