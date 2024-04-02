import Facebook from "../scripts/facebook";
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
	private getPhotos = (uri: string) => {
		const facebook = new Facebook(uri);
		const url = facebook.getPhotos();
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

	public setToStorage = async (key: string, value: any) => {
		return new Promise((resolve) => {
			chrome.storage.sync.set({ [key]: value }, () => {
				resolve(true);
			});
		});
	};

	private defineIntercept() {
		chrome.webRequest.onBeforeRequest.addListener(
			(details) => {
				if (details.url) {
					const url = new URL(details.url);
					if (
						url.pathname === "/api/graphql/" &&
						details.requestBody &&
						Object.hasOwn(details.requestBody, "formData")
					) {
						const requestFormData = details.requestBody.formData;
						if (!requestFormData) return;

						const requestType = Object.hasOwn(
							requestFormData,
							"fb_api_req_friendly_name"
						)
							? requestFormData.fb_api_req_friendly_name[0]
							: undefined;
						if (requestType === "storiesUpdateSeenStateMutation") {
							const data = requestFormData;

							this.setToStorage("STORY_SEEN", data);
						}
					}
				}
			},
			{ urls: ["https://*.facebook.com/*"] },
			["requestBody"]
		);
	}

	private defineMessages() {
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			switch (message.type) {
				case "download":
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
				default:
					break;
			}
		});
	}

	private defineStateChange() {
		chrome.webNavigation.onHistoryStateUpdated.addListener((change) => {
			console.log(
				"🚀 ~ Stories ~ chrome.webNavigation.onHistoryStateUpdated.addListener ~ change:",
				change
			);
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				// Send a message to the content script in the active tab
				chrome.tabs.sendMessage(tabs[0].id!, { message: {type: "stateChange" , data: change}});
			});
		});
	}
}

new Background();
