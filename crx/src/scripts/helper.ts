import { IStorage } from "@src/types";
import { MessageTypes } from "@src/types/enums";
import zip from "jszip";

class Helpers {
	static async generateZip(links: string[], userId: number): Promise<string> {
		const zipFile = new zip();
		let i = 0;
		for (const link of links) {
			const response = await fetch(link);
			const data = await response.arrayBuffer();
			zipFile.file(`${userId}_${i}.png`, data);
			i++;
		}

		const zipStream = await zipFile.generateAsync({ type: "base64" });
		return zipStream;
	}

	static async saveBlob(base64: string) {
		return `data:application/zip;base64,${base64}`;
	}

	static getFromStorage: IStorage = async (key: string) => {
		return new Promise((resolve) => {
			chrome.storage.local.get([key], (result) => {
				if (!result) resolve(null);
				resolve(result[key]);
			});
		});
	};

	static download = (
		url: string,
		filename: string,
		ext: "zip" | "png" | "mp4"
	) => {
		chrome.runtime.sendMessage({
			type: MessageTypes.DOWNLOAD,
			data: {
				url,
				filename,
				ext,
			},
		});
	};

	static openTab = (url: string) => {
		console.log("🚀 ~ Helpers ~ url:", url)
		chrome.runtime.sendMessage({
			type: MessageTypes.OPEN_TAB,
			data: url,
		});
	};
	static sendMessage = <T>(type: string, data: T) => {
		chrome.runtime.sendMessage({
			type,
			data,
		});
	}
	
}

export default Helpers;
