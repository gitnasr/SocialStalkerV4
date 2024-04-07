import { Facebook as F, Instagram as I } from "@src/types";

import FB from "./facebook";
import { MessageTypes } from "@src/types/enums";
import Utils from "./utils";
import moment from "moment";

export default class Background {
	private facebook = new FB();
	constructor() {
		this.defineIntercept();
		this.defineMessages();
		this.defineStateChange();
	}

	private interceptFacebook(request: chrome.webRequest.WebRequestBodyDetails) {
		const requestFormData = request?.requestBody
			?.formData as unknown as F.StoryRequest;
		if (!requestFormData) return;

		const requestType = Object.hasOwn(
			requestFormData,
			"fb_api_req_friendly_name"
		)
			? requestFormData.fb_api_req_friendly_name[0]
			: undefined;
		if (requestType === "storiesUpdateSeenStateMutation") {
			const data = requestFormData;
			Utils.setToStorage<F.StoryRequest>(MessageTypes.STORY_SEEN, data);
		}
	}

	private interceptInstagram(
		request: chrome.webRequest.WebRequestBodyDetails,
		url: URL
	) {
		const requestFormData = request?.requestBody?.formData as Record<
			keyof I.StoryGraphQl,
			string[]
		>;

		if (url.pathname === "/api/graphql") {
			if (!requestFormData) return;
			const data = requestFormData;

			const storyType = Object.hasOwn(data, "fb_api_req_friendly_name");

			if (
				storyType &&
				(data.fb_api_req_friendly_name[0] ===
					"usePolarisStoriesV3SeenMutation" ||
					data.fb_api_req_friendly_name[0] === "PolarisAPIReelSeenMutation")
			) {
				Utils.setToStorage(MessageTypes.INSTAGRAM_STORY_SEEN, data);
			}
		}
		if (url.pathname === "/api/v1/users/web_profile_info/") {
			//2. This is method 2 to get profile data
			Utils.setToStorage(MessageTypes.INSTAGRAM_PROFILE, {
				userId: null,
				username: url.searchParams.get("username"),
			});
		}
	}

	private defineIntercept() {
		const interceptionURLS = [
			"https://*.facebook.com/*",
			"https://*.instagram.com/*",
		];
		chrome.webRequest.onBeforeRequest.addListener(
			(details) => {
				if (details.url) {
					const url = new URL(details.url);
					if (
						url.pathname === "/api/graphql/" &&
						url.hostname === "www.facebook.com"
					) {
						this.interceptFacebook(details);
					}

					if (url.hostname === "www.instagram.com") {
						this.interceptInstagram(details, url);
					}
				}
			},
			{ urls: interceptionURLS },
			["requestBody"]
		);
	}

	private defineMessages() {
		chrome.runtime.onMessage.addListener(
			(message, sender, sendResponseBack) => {
				(async () => {
					console.log("🚀 ~ file: main.ts ~ line 116 ~ message", message);

					switch (message.type) {
						case MessageTypes.DOWNLOAD:
							{
								const payload = message.data;
								chrome.downloads.download({
									url: payload.url,
									filename: `${payload.filename}_${moment()
										.unix()
										.toString()}.${payload.ext}`,
								});
							}
							return;
						case MessageTypes.OPEN_TAB:
							{
								const url = message.data;
								chrome.tabs.create({ url });
							}
							return;
						case MessageTypes.INSTA_HIGHLIGH_CACHE:
							{
								Utils.setToStorage(
									MessageTypes.INSTA_HIGHLIGH_CACHE,
									message.data
								);
							}
							return;
						case MessageTypes.GET_FACEBOOK_PROFILE:
							{
								const url = message.data;
								const info = await this.facebook.getBasicInfo(url);
								sendResponseBack(info);
							}
							return;
						case MessageTypes.GET_FACEBOOK_ALBUMS:
							{
								const { userId  } = message.data;
								const albums = await this.facebook.getPhotos(userId);
								sendResponseBack(albums);
							}
							return;
						default:
							break;
					}
				})();
				return true;
			}
		);
	}

	private defineStateChange() {
		chrome.webNavigation.onHistoryStateUpdated.addListener((change) => {
			Utils.sendToContentScript(MessageTypes.STATE_CHANGE, change);
		});
	}
}
