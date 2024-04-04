import { Facebook as F, Instagram as I } from "@src/types";

import Facebook from "../scripts/facebook";
import { MessageTypes } from "@src/types/enums";
import Utils from "./utils";
import moment from "moment";

class Background {
	constructor() {
		this.defineContextMenu();
		this.defineCallbacks();
		this.defineIntercept();
		this.defineMessages();
		this.defineStateChange();
	}
	private defineContextMenu() {
		chrome.contextMenus.removeAll();
		chrome.contextMenus.create({
			documentUrlPatterns: ["*://*.facebook.com/*"],
			id: "DownloadAll",
			title: "Download All",
			contexts: ["page"],
		});

		chrome.contextMenus.create({
			documentUrlPatterns: ["*://*.facebook.com/*"],

			id: "UnlockAll",
			title: "View Full Size Profile Picture",
			contexts: ["page"],
		});
	}
	private FullSize = async (uri: string) => {
		const facebook = new Facebook(uri);
		const url = await facebook.getProfilePicture();
		chrome.tabs.create({
			url: url,
		});
	};
	private getPhotos = async (uri: string) => {
		const facebook = new Facebook(uri);
		await facebook.getPhotos();
	};

	private defineCallbacks() {
		chrome.contextMenus.onClicked.addListener((info, tab) => {
			if (tab && tab.url) {
				switch (info.menuItemId) {
					case "UnlockAll":
						this.FullSize(tab.url);
						break;
					case "DownloadAll":
						return this.getPhotos(tab.url);
					default:
						break;
				}
			}
		});
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
		const requestFormData = request?.requestBody
			?.formData;

		if (url.pathname === "/api/graphql") {
			if (!requestFormData) return;
			const data = Utils.flatten<I.StoryGraphQl>(requestFormData as unknown as I.StoryGraphQl);
	
			const storyType = Object.hasOwn(data, "fb_api_req_friendly_name");

			if (
				storyType &&
				(data.fb_api_req_friendly_name === "usePolarisStoriesV3SeenMutation" || data.fb_api_req_friendly_name === "PolarisAPIReelSeenMutation")
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
		chrome.runtime.onMessage.addListener((message) => {
			switch (message.type) {
				case MessageTypes.DOWNLOAD:
					{
						const payload = message.data;
						chrome.downloads.download({
							url: payload.url,
							filename: `${payload.filename}_${moment().unix().toString()}.${
								payload.ext
							}`,
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
				default:
					break;
			}
		});
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
