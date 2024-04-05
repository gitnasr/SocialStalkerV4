import { Facebook as F, Instagram as I } from "@src/types";

import CORSFacebook from "./Facebook";
import { MessageTypes } from "@src/types/enums";
import moment from "moment";

class Background {
	constructor() {
		this.defineIntercept();
		this.defineMessages();
		this.defineStateChange();
	}

	public setToStorage = async <T>(key: string, value: T) => {
		return new Promise((resolve) => {
			chrome.storage.local.set({ [key]: value }, () => {
				resolve(true);
			});
		});
	};

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
			this.setToStorage(MessageTypes.STORY_SEEN, data);
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
				this.setToStorage(MessageTypes.INSTAGRAM_STORY_SEEN, data);
			}
		}
		if (url.pathname === "/api/v1/users/web_profile_info/") {
			//2. This is method 2 to get profile data
			this.setToStorage(MessageTypes.INSTAGRAM_PROFILE, {
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
						case MessageTypes.INSTA_STORY_CACHE:
							{
								this.setToStorage(MessageTypes.INSTA_STORY_CACHE, message.data);
							}
							return;
						case MessageTypes.GET_FACEBOOK_PROFILE:
							{
								const url = message.data;
								const info = await CORSFacebook.getBasicInfo(url);
								sendResponseBack(info);
							}
							return;
						case MessageTypes.GET_FACEBOOK_ALBUMS:
							{
								const { userId, name } = message.data;
								const albums = await CORSFacebook.getPhotos(name, userId);
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
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				if (tabs.length === 0) return;

				if (tabs[0].id) {
					chrome.tabs.sendMessage(tabs[0].id, {
						message: { type: MessageTypes.STATE_CHANGE, data: change },
					});
				}
			});
		});
	}
}

new Background();
