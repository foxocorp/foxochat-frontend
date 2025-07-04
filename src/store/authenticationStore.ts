import { makeAutoObservable } from "mobx";

class AuthenticationStore {
	token: string | null = null;
	isAuthenticated = false;

	constructor() {
		makeAutoObservable(this);
		this.checkAuth();
	}

	async login(token: string) {
		this.token = token;
		this.isAuthenticated = true;
		this.saveTokenToLocalStorage(token);
	}

	logout() {
		this.token = null;
		this.isAuthenticated = false;
		this.clearTokenFromLocalStorage();
	}

	checkAuth() {
		const token = this.getTokenFromLocalStorage();
		if (token) {
			this.token = token;
			this.isAuthenticated = true;
		} else {
			this.logout();
		}
	}

	public getTokenFromLocalStorage() {
		return localStorage.getItem("authToken");
	}

	protected saveTokenToLocalStorage(token: string) {
		localStorage.setItem("authToken", token);
	}

	protected clearTokenFromLocalStorage() {
		localStorage.removeItem("authToken");
	}
}

const authenticationStore = new AuthenticationStore();

export function useAuthStore() {
	return authenticationStore;
}
