import { useAuthStore } from '~/store/useAuthStore';

export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore();
    authStore.checkAuth();

    if (!authStore.isAuthenticated && to.path !== '/auth/login' && to.path !== '/auth/register') {
        return navigateTo('/auth/login');
    }
});
