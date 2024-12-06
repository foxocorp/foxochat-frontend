const getAuthToken = () => localStorage.getItem('authToken');

const getApiBase = () => 'https://api.dev.foxogram.su';

const Request = async (url, method, body = null, isAuthRequired = false) => {
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
		const url = `${getApiBase()}/auth/register`;
		return await Request(url, 'POST', { username, email, password });
	},

	async login(email, password) {
		const url = `${getApiBase()}/auth/login`;
		const data = await Request(url, 'POST', { email, password });

		if (data.token) {
			localStorage.setItem('authToken', data.token);
		}

		return data;
	},

};
