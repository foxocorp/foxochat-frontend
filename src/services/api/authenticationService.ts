import {
    APIException,
    RESTPostAPIAuthLoginBody,
    RESTPostAPIAuthLoginResult,
    RESTPostAPIAuthRegisterBody,
    RESTPostAPIAuthRegisterResult,
    RESTPostAPIAuthVerifyEmailResult,
    RESTPostAPIAuthResendEmailResult
} from "@foxogram/api-types";

const getAuthToken = () => localStorage.getItem("authToken");

const getApiBase = () => "https://api.dev.foxogram.su";

async function Request<T>(url: string, method: string, body: unknown = null, isAuthRequired = false): Promise<T> {
    const token = isAuthRequired ? getAuthToken() : null;
    const headers = {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
    };

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
        const error: APIException = await response.json();
        throw new Error(error.message || "Something went wrong");
    }

    return await response.json() as T;
}

export const api = {
    async register(body: RESTPostAPIAuthRegisterBody): Promise<RESTPostAPIAuthRegisterResult> {
        const url = `${getApiBase()}/auth/register`;
        return await Request(url, "POST", body);
    },

    async login(body: RESTPostAPIAuthLoginBody): Promise<RESTPostAPIAuthLoginResult> {
        const url = `${getApiBase()}/auth/login`;
        const data: RESTPostAPIAuthLoginResult = await Request(url, "POST", body);

        if (data.accessToken) {
            localStorage.setItem("authToken", data.accessToken);
        }

        return data;
    },

    async verifyEmail(code: string): Promise<RESTPostAPIAuthVerifyEmailResult> {
        const url = `${getApiBase()}/auth/email/verify`;
        const body = { code };
        return await Request(url, "POST", body, true);
    },

    async resendEmail(): Promise<RESTPostAPIAuthResendEmailResult> {
        const url = `${getApiBase()}/auth/email/resend`;
        return await Request(url, "POST", null, true);
    }
};