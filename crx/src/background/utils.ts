import { MessageTypes } from "@src/types/enums";

class Utils {
	static sendNotification(message: string) {
		chrome.notifications.create({
			type: "basic",
			iconUrl: "icon-128.png",
			title: "Facebook Downloader",
			message: message,
		});
	}

	static setToStorage = async <T>(key: string, value: T) => {
		return new Promise((resolve) => {
			chrome.storage.local.set({ [key]: value }, () => {
				resolve(true);
			});
		});
	};
	static sendToContentScript<T>(type: MessageTypes, data: T) {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			if (tabs.length === 0) return;

			if (tabs[0].id) {
				chrome.tabs.sendMessage(tabs[0].id, { type: type, data: data });
			}
		});
	}

	static getCookieByWebsite = async (url: string, name: string) => {
		return new Promise((resolve) => {
			chrome.cookies.get({ url, name }, (cookie) => {
				if (!cookie) resolve(null);
				resolve(cookie?.value);
			});
		});
	};
}

export default Utils;
