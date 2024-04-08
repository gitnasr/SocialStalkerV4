class Api {
	private static apiURL =
		process.env.NODE_ENV === "development"
			? process.env.VITE_DEV_BACKEND_URL
			: process.env.VITE_PROD_BACKEND_URL;
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

	static async post<T>(url: string, data: T) {
		const response = await fetch(`${this.apiURL}${url}`, {
			method: "POST",
			headers: this.headers,
			body: JSON.stringify(data),
		});
		return await response.json();
	}
}

export default Api;
