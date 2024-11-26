const getAuthToken = () => localStorage.getItem('authToken');
const getApiBase = () => useRuntimeConfig().public.apiBase;

const makeRequest = async (url, method, body = null, isAuthRequired = false) => {
    const token = isAuthRequired ? getAuthToken() : null;
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
    }

    return await response.json();
};

export const api = {
    async register(username, email, password) {
        const url = `${getApiBase()}/v1/auth/signup`;
        return await makeRequest(url, 'POST', { username, email, password });
    },

    async login(email, password) {
        const url = `${getApiBase()}/v1/auth/login`;
        const data = await makeRequest(url, 'POST', { email, password });

        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }

        return data;
    },

    async verifyEmail(emailCode) {
        const url = `${getApiBase()}/v1/auth/email/verify/${emailCode}`;
        return await makeRequest(url, 'POST', null, true);
    },

    async deleteAccount(password) {
        const url = `${getApiBase()}/v1/auth/delete`;
        return await makeRequest(url, 'POST', { password }, true);
    },

    async confirmDelete(deleteCode) {
        const url = `${getApiBase()}/v1/auth/delete/confirm/${deleteCode}`;
        return await makeRequest(url, 'POST', null, true);
    },
};
