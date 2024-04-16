class Api {
	private static apiURL = import.meta.env.DEV
		? import.meta.env.VITE_DEV_BACKEND_URL
		: import.meta.env.VITE_PROD_BACKEND_URL;
	private static headers = {
		"Content-Type": "application/json",
	};

	static async get(url: string) {
		const response = await fetch(`${this.apiURL}${url}`, {
			method: "GET",
			headers: this.headers,
		});
		return await response.json();
	}

	static async post<T>(endpoint: string, data: T) {
		const response = await fetch(`${this.apiURL}/${endpoint}`, {
			method: "POST",
			headers: this.headers,
			body: JSON.stringify(data),
		});
		return await response.json();
	}
}

export default Api;
