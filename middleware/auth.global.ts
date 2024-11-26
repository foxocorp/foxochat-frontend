import { useAuthStore } from '~/store/useAuthStore';
import { getAuthToken } from '~/utils/auth';

export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore();
    const token = getAuthToken();

    if (!token && (to.path === '/auth/login' || to.path === '/auth/register')) {
        return;
    }

    if (!token && to.path !== '/auth/login') {
        return navigateTo('/auth/login');
    }

    if (token) {
        authStore.login(token);
    }
});
