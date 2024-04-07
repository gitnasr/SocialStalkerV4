interface IResponse<T> {
	status: number;
	html?: string;
	json?: T;
}
type ContentType = "application/json" | "application/x-www-form-urlencoded";
class Connector {
	protected async request(
		url: string,
		options: RequestInit,
		json = false
	) {
		const response = await fetch(url, options);
		return {
			status: response.status,
			html: !json ? await response.text() : "",
			json: json ? await response.json() : null,
		};
	}

	public async get<T>(url: string, json = false, headers={}): Promise<IResponse<T>> {
		const res = await this.request(
			url,
			{
				method: "GET",
				headers: headers,
			},
			json
		);
		if (res.status !== 200) {
			throw new Error("Failed to fetch data");
		}
		return {
			status: res.status,
			html: res.html,
			json: res.json,
		}
	}

	public async post<T>(
		url: string,
		data: any,
		contentType: ContentType = "application/json",
		returnJson = true,
		headers = {}
	): Promise<IResponse<T>> {
		return await this.request(
			url,
			{
				method: "POST",
				headers: {
					"Content-Type": contentType,
					...headers,
				},
				body:
					contentType === "application/json"
						? JSON.stringify(data)
						: new URLSearchParams(data).toString(),

			},
			returnJson
		);
	}
}

export default Connector;
