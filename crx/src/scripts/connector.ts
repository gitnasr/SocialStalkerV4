interface IResponse {
    status: number;
    html?: string;
    json?: any
}
type ContentType  = "application/json" | "application/x-www-form-urlencoded"
class Connector {

    protected async request(url: string, options: RequestInit, json = false): Promise<IResponse> {
        const response = await fetch(url, options);
        return {
            status: response.status,
            html: !json ? await response.text() : "",
            json: json ? await response.json() : null,
        }
    }

    public async get(url: string, json = false): Promise<any> {
        const res =  await this.request(url, {
            method: "GET",
        }, json );
        if (res.status !== 200) {
            throw new Error("Failed to fetch data")
        }
        return res.html;
    }

    public async post(url: string, data: any, contentType:ContentType = "application/json", returnJson = true ): Promise<IResponse> {
        return await this.request(url, {
            method: "POST",
            headers: {
                "Content-Type": contentType,
            },
            body : contentType === "application/json" ? JSON.stringify(data) : new URLSearchParams(data).toString()
        }, returnJson);
    }
}

export default Connector;