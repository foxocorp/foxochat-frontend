import { useAuthStore } from '~/store/useAuthStore';
import { getAuthToken } from '~/utils/auth';

export default defineNuxtRouteMiddleware((to) => {
    const publicRoutes = ['/auth/login', '/auth/register', '/'];

    if (publicRoutes.includes(to.path)) {
        return;
    }

    if (!to.matched.length) {
        return;
    }

    const token = getAuthToken();
    const authStore = useAuthStore();

    if (!token) {
        return navigateTo('/auth/login');
    }

    if (token && !authStore.isAuthenticated) {
        authStore.login(token);
    }
});
