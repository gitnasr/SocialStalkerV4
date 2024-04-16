import { Facebook as F, File } from "@src/types";

import Connector from "@src/scripts/connector";
import DEditor from "@src/scripts/dom";
import { MessageTypes } from "@src/types/enums";
import Utils from "./utils";
import _ from "underscore";

export default class CORSFacebook {
	private connector: Connector = new Connector();

	async getBasicInfo(url: string): F.Info {
		const info = {
			userId: 0,
			username: "",
			name: "",
		};
		let username = url.split("/")[3];
		let userId = 0;
		if (username.includes("?id=")) {
			const u = new URL(url);
			username = u.searchParams.get("id") || "";
			username = username.split("&")[0];
		}

		const isUsernameNumeric = /^\d+$/.test(username);
		if (isUsernameNumeric) {
			url = `https://mbasic.facebook.com/profile.php?id=${username}`;
			info.username = username;
			userId = parseInt(username);
		} else {
			url = `https://mbasic.facebook.com/${username}`;
			info.username = username;
		}
		const res = await this.connector.get<string>(url);
		if (!res || !res.html) return;

		const title = DEditor.getTitle(res.html);
		info.name = title;

		const userIdResult = /owner_id=(\d+)/.exec(res.html);
		if (!userId && userIdResult) {
			userId = parseInt(userIdResult[1]);
		}
		info.userId = userId;
		return info;
	}

	private async getFullPhotos(userId: number): Promise<string[] | undefined> {
		const url = `https://mbasic.facebook.com/profile.php?id=${userId}&v=photos`;
		const res = await this.connector.get<string>(url);
		if (!res || !res.html) return;
		const partialSeeAllURL = DEditor.findURLsByText("See all", res.html);

		if (partialSeeAllURL && partialSeeAllURL.length > 0) {
			return partialSeeAllURL.map((url) => `https://mbasic.facebook.com${url}`);
		}
	}

	private async getMorePhotos(urls: string[]) {
		let photos: string[] = [];

		for (const url of urls) {
			let current_url = url;
			let pageCount = 0; // Track fetched page count for error handling
			let isHasNext = true;

			try {
				while (isHasNext) {
					pageCount++;
					const res = await this.connector.get<string>(current_url);
					if (!res || !res.html) return;

					const photoElements = DEditor.findLinkByClass("s", res.html);
					photos = photos.concat(...photoElements);
					const lastElement = _.last(photoElements);
					if (lastElement && !lastElement.includes("?owner_id=")) {
						isHasNext = false;
						break;
					}
					current_url = `https://mbasic.facebook.com${lastElement}`;
					photos.pop();
				}

				photos = photos.map(
					(photo) => (photo.match(/(?<=fbid=)\d+/) || [""])[0]
				);
			} catch (e) {
				console.error(
					"Error while fetching photos",
					e,
					`Page was ${pageCount}`
				);
				console.log("Fetched photos", `Detected ${photos.length} photos`);
				// TODO: Register Error with data in BACKEND
			}
		}
		return photos;
	}

	private async getPhotoURLs(photosIds: string[]): Promise<File[] | undefined> {
		const photoURLs: File[] = [];
		let i = 1;
		for (const id of photosIds) {
			try {
				Utils.sendToContentScript(MessageTypes.PROGRESS_UPDATE, {
					current: i,
					total: photosIds.length,
				});

				const url = `https://mbasic.facebook.com/photo/view_full_size/?fbid=${id}`;
				const { html } = await this.connector.get<string>(url);
				if (!html) return;
				const photoURL = DEditor.findURLByText("here", html);
				if (photoURL) {
					photoURLs.push({
						extension: "png",
						url: photoURL,
						id,
						fileName: `fb_${id}`,
					});
				} else {
					// Check if user blocked
					const title = DEditor.getTitle(html);
					if (
						title.includes("Content Not Found") ||
						title.includes("Blocked")
					) {
						const url = `https://graph.facebook.com/${id}/picture?width=4080&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
						const response = await fetch(url, { redirect: "follow" });
						const res = response.url;
						photoURLs.push({
							extension: "png",
							url: !res.includes(".gif") ? url : "",
							fileName: `fb_${id}`,
							id,
						});
					} else {
						photoURLs.push({
							extension: "png",
							url: "",
							fileName: "",
							id,
						});
					}
				}

				i++;
			} catch (e) {
				console.error("Error while fetching photo", e);
				// TODO: Register Error with data in BACKEND
			}
		}
		return photoURLs;
	}

	async getPhotos(userId: number) {
		Utils.sendToContentScript(MessageTypes.START_PROGRESS, {});
		const SeeAllURL = await this.getFullPhotos(userId);

		if (!SeeAllURL) return Utils.sendNotification("No photos found");

		const imagesIds = await this.getMorePhotos(SeeAllURL);

		if (!imagesIds) return Utils.sendNotification("No photos found");

		const photoURLs = await this.getPhotoURLs(imagesIds);

		if (photoURLs?.length === 0)
			return Utils.sendNotification("Account Blocked, Please try again later");

		return photoURLs;
	}
}
