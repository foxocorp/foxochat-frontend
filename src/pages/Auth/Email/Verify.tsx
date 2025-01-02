import { FunctionalComponent } from "preact";
import { useEffect } from "preact/hooks";
import { useLocation } from "preact-iso";
import { api } from "@services/api/authenticationService.ts";

const EmailConfirmationHandler: FunctionalComponent = () => {
    const location = useLocation();
    const code: string | undefined = location.query["code"];

    useEffect(() => {
        const confirmEmail = async (): Promise<void> => {
            try {
                if (!code) {
                    window.location.href = "/auth/register?error=invalid-code";
                    return;
                }

                await api.verifyEmail(code);
                window.location.href = "/";
            } catch (error) {
                window.location.href = "/auth/register?error=email-confirmation-failed";
            }
        };

        confirmEmail().catch((error: unknown) => {
            console.error("Unexpected error:", error);
            window.location.href = "/auth/register?error=unknown-error";
        });
    }, [code]);

    return <div>Processing...</div>;
};

export default EmailConfirmationHandler;
