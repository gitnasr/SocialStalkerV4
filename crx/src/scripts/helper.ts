import { MessageTypes } from "@src/types/enums";
import zip from "jszip";

class Helpers {
	public static async generateZip(
		links: string[],
		userId: number
	): Promise<string> {
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

	public static async saveBlob(base64: string) {
		return `data:application/zip;base64,${base64}`;
	}

	static getFromStorage = async (key: string) => {
		return new Promise((resolve) => {
			chrome.storage.sync.get([key], (result) => {
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
}

export default Helpers;
