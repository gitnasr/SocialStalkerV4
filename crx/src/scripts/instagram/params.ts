class Params {
    static get SearchQueryHeaders() {
        return  {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9,tr;q=0.8,es;q=0.7",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded",
            dpr: "1",
            pragma: "no-cache",
            "sec-ch-prefers-color-scheme": "dark",
            "sec-ch-ua":
                '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
            "sec-ch-ua-full-version-list":
                '"Not A(Brand";v="99.0.0.0", "Google Chrome";v="121.0.6167.184", "Chromium";v="121.0.6167.184"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-model": '""',
            "sec-ch-ua-platform": '"macOS"',
            "sec-ch-ua-platform-version": '"13.4.1"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "viewport-width": "863",
            "x-asbd-id": "918374",
            "x-bloks-version-id":
                "c6c7b90c445758d2f27d257e0b850f3b5e7b27dfbb81b6a470d6a40cb040a25a",
            "x-csrftoken": "yNmAkP3tQl4eV7sHcDoRfW9gZsX1A2bE", // Replace with your actual X-CSRFToken (if needed)
            "x-fb-friendly-name": "PolarisUserHoverCardContentV2Query",
            "x-fb-lsd": "pLxQbR4a9HgWu1sVyFnCdM3eLxP9sV7j",
            "x-ig-app-id": "672145893218637",
        }
    }
    static  SearchQueryParams(username:string, userId:number){
        return new URLSearchParams({
			__d: "www",
			__user: "0",
			__a: "1",
			__req: "1o",
			fb_api_caller_class: "RelayModern",
			fb_api_req_friendly_name: "PolarisUserHoverCardContentV2Query",
			variables: JSON.stringify({ userID: userId, username }),
			server_timestamps: "true",
			doc_id: "7666785636679494",
		}).toString();
    }
}

export default Params;