class Params {
	static get SearchQueryHeaders() {
		return {
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
			"x-csrftoken": "yNmAkP3tQl4eV7sHcDoRfW9gZsX1A2bE",
			"x-fb-friendly-name": "PolarisUserHoverCardContentV2Query",
			"x-fb-lsd": "pLxQbR4a9HgWu1sVyFnCdM3eLxP9sV7j",
			"x-ig-app-id": "672145893218637",
		};
	}
	static SearchQueryParams(username: string, userId: number) {
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
	static Selectors() {
		return {
			actionButtons:
				".x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1n2onr6.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1",
			bioSection:
				".x7a106z.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x78zum5.xdt5ytf.x2lah0s.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x11njtxf.xwonja6.x1dyjupv.x1onnzdu.xwrz0qm.xgmu61r.x1nbz2ho.xbjc6do",
			saveButton: "svg[aria-label='Save']",
		};
	}
	static get BasicHeaders() {
		return {
			"x-asbd-id": "46548741",
			"x-ig-app-id": 936619743392459,
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36",
		};
	}
}

export default Params;
