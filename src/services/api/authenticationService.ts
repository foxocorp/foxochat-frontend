import { API } from "@foxogram/api";
import { REST } from "@foxogram/rest";
import { RESTPostAPIAuthLoginBody, RESTPostAPIAuthRegisterBody } from "@foxogram/api-types";

const getAuthToken = () => localStorage.getItem("authToken");

const rest = new REST();
rest.setToken(getAuthToken() || "");
export const api = new API(rest);

export const apiMethods = {
    async register(body: RESTPostAPIAuthRegisterBody) {
        try {
            const data = await api.auth.register(body);
            if (data.accessToken) {
                localStorage.setItem("authToken", data.accessToken);
            }
            return data;
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    },
    async login(body: RESTPostAPIAuthLoginBody) {
        try {
            const data = await api.auth.login(body);
            if (data.accessToken) {
                localStorage.setItem("authToken", data.accessToken);
            }
            return data;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    },
    async verifyEmail(code: string) {
        try {
            return await api.auth.verifyEmail({ code });
        } catch (error) {
            console.error("Email verification error:", error);
            throw error;
        }
    },
    async resendEmail() {
        try {
            return await api.auth.resendEmail();
        } catch (error) {
            console.error("Resend email error:", error);
            throw error;
        }
    },
    async resetPassword(email: string) {
        try {
            return await api.auth.resetPassword({ email });
        } catch (error) {
            console.error("Reset password error:", error);
            throw error;
        }
    },
    async resetPasswordConfirm(email: string, code: string, newPassword: string) {
        try {
            return await api.auth.resetPasswordConfirm({ email, code, newPassword });
        } catch (error) {
            console.error("Reset password confirmation error:", error);
            throw error;
        }
    },
};
