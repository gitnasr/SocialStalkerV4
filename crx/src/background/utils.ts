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
		console.log("Downloading", url, filename);
		chrome.downloads.download({
			url: url,
			filename: `${filename}.${ext}`,
		});
	}
}


export default Utils;