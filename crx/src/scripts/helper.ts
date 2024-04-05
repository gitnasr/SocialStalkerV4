import { IStorage } from "@src/types";
import { MessageTypes } from "@src/types/enums";
import zip from "jszip";

interface Files {
	type: "png" | "mp4";
	url: string;
}
class Helpers {
	static async generateZip(links: Files[], userId: number): Promise<string> {
		const zipFile = new zip();
		let i = 0;
		for (const file of links) {
			const response = await fetch(file.url);
			const data = await response.arrayBuffer();
			zipFile.file(`${userId}_${i}.${file.type}`, data);
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
	};
}

export default Helpers;
