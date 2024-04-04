import { Flat } from "@src/types";

class Utils {
	static sendNotification(message: string) {
		chrome.notifications.create({
			type: "basic",
			iconUrl: "icon-128.png",
			title: "Facebook Downloader",
			message: message,
		});
	}
	static download = (url: string, filename: string, ext: "zip"| "png" | "mp4") => {
		chrome.downloads.download({
			url: url,
			filename: `${filename}.${ext}`,
		});
	}
	static flatten: Flat = (formData) => {
		const data: Record<string, string> = {};
		for (const [key, value] of Object.entries(formData)) {
			data[key] = value[0];
		}
		return data;
	}

}


export default Utils;