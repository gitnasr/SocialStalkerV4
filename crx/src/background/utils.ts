
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


}


export default Utils;