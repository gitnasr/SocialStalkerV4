import { File, IStorage } from "@src/types";

import { MessageTypes } from "@src/types/enums";
import zip from "jszip";

chrome.runtime.onMessage.addListener((message) => {
	if (message.type === MessageTypes.PROGRESS_UPDATE) {
		const { current, total } = message.data;
		Helpers.UpdateProgressBar(current, total);
	}
	if (message.type === MessageTypes.START_PROGRESS) {
		Helpers.AttachProgressBar();
	}
});

class Helpers {
	static AttachProgressBar = () => {
		const div = document.createElement("div");
		div.id = "social-stalker-progress-bar";

		document.body.appendChild(div);
	};
	static UpdateProgressBar = (current: number, total: number) => {
		const percentage = Math.floor((current / total) * 100);
		const progressBar = document.querySelector(
			"#social-stalker-progress-bar"
		) as HTMLDivElement;
		if (!progressBar) return;
		progressBar.style.width = `${percentage}%`;
		progressBar.innerText = `${percentage}%`;
		if (percentage === 100) this.detachProgressBar();

	};
	static detachProgressBar = () => {
		const div = document.querySelector("#social-stalker-progress-bar");
		if (div) {
			div.remove();
		}
	};
	static async generateZip(
		links: File[],
		prefix: number | string
	): Promise<string> {
		// Initialize the zip file
		const zipFile = new zip();

		// Calculate the total number of steps
		const total = links.length;

		// Attach progress bar
		Helpers.AttachProgressBar();

		try {
			// Loop through each file
			for (let i = 0; i < total; i++) {
				// Update progress bar for each file
				Helpers.UpdateProgressBar(i + 1, total);
				const link = links[i].url;
				// Skip if the file URL is not provided
				if (!link) continue;
				// Fetch the file data
				const response = await fetch(link);
				const data = await response.arrayBuffer();

				// Add the file to the zip
				if (links[i].fileName){
					zipFile.file(`${links[i].fileName}.${links[i].extension}`, data);
				}else{
					zipFile.file(`${prefix}_${i + 1}.${links[i].extension}`, data);
				}
				
			}

			// Generate the zip file
			const zipStream = await zipFile.generateAsync({ type: "blob" });

			// Update progress bar
			Helpers.UpdateProgressBar(total, total);

			// Create object URL for the zip blob
			const url = URL.createObjectURL(
				new Blob([zipStream], { type: "application/zip" })
			);

			return url;
		} catch (error) {
			// Handle any errors
			console.error("Error generating zip:", error);
			throw error;
		} finally {
			// Detach progress bar
			Helpers.detachProgressBar();
		}
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
