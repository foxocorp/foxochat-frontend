import { makeAutoObservable } from 'mobx';

class AuthenticationStore {
	token: string | null = null;
	isAuthenticated: boolean = false;

	constructor() {
		makeAutoObservable(this);
		this.checkAuth();
	}

	login(token: string) {
		this.token = token;
		this.isAuthenticated = true;
		this.saveTokenToCookie(token);
	}

	logout() {
		this.token = null;
		this.isAuthenticated = false;
		this.clearTokenFromCookie();
	}

	checkAuth() {
		const token = this.getTokenFromCookie();
		if (token) {
			this.token = token;
			this.isAuthenticated = true;
		} else {
			this.logout();
		}
	}

	private getTokenFromCookie() {
		return document.cookie.replace(/(?:(?:^|.*;\s*)authToken\s*\=\s*([^;]*).*$)|^.*$/, '$1') || null;
	}

	private saveTokenToCookie(token: string) {
		document.cookie = `authToken=${token}; path=/;`;
	}

	private clearTokenFromCookie() {
		document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
	}
}

const authenticationStore = new AuthenticationStore();

export function useAuthStore() {
	return authenticationStore;
}
