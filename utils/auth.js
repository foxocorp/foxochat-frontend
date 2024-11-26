export function setAuthToken(token) {
    if (process.client) {
        localStorage.setItem('authToken', token);
    }
}

export function getAuthToken() {
    if (process.client) {
        return localStorage.getItem('authToken');
    }
    return null;
}

export function removeAuthToken() {
    if (process.client) {
        localStorage.removeItem('authToken');
    }
}
