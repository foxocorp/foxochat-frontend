import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: false,
    }),

    actions: {
        login(token: string) {
            useCookie('authToken').value = token;
            this.isAuthenticated = true;
        },

        logout() {
            useCookie('authToken').value = '';
            this.isAuthenticated = false;
        },

        checkAuth() {
            const token = useCookie('authToken').value;
            this.isAuthenticated = !!token;

            if (!this.isAuthenticated) {
                this.logout();
            }
        },
    },
});
