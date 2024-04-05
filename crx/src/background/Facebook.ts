import Connector from "@src/scripts/connector";
import DEditor from "@src/scripts/dom";
import { Facebook as F } from "@src/types";
import Helpers from "@src/scripts/helper";
import Utils from "./utils";
import _ from "underscore";
import moment from "moment";

class CORSFacebook {
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
		const html = await this.connector.get(url);
		const title = DEditor.getTitle(html);
		info.name = title;

		const userIdResult = /owner_id=(\d+)/.exec(html);
		if (!userId && userIdResult) {
			userId = parseInt(userIdResult[1]);
		}
		info.userId = userId;
		return info;
	}

	private async getFullPhotos(userId: number): Promise<string | undefined> {
		const url = `https://mbasic.facebook.com/profile.php?id=${userId}&v=photos`;
		const html = await this.connector.get(url);
		const partialSeeAllURL = DEditor.findURLByText("See All", html);
		if (partialSeeAllURL) {
			return `https://mbasic.facebook.com${partialSeeAllURL}`;
		}
	}

	private async getMorePhotos(url: string) {
		let current_url = url;
		let photos: string[] = [];
		let pageCount = 0; // Track fetched page count for error handling
		let isHasNext = true;
		try {
			while (isHasNext) {
				pageCount++;
				const html = await this.connector.get(current_url);
				const photoElements = DEditor.findLinkByClass("s", html);
				photos = photos.concat(...photoElements);

				const lastElement = _.last(photoElements);
				if (lastElement && !lastElement.includes("?owner_id=")) {
					isHasNext = false;
					break;
				}
				current_url = `https://mbasic.facebook.com${lastElement}`;
				photos.pop();
			}
		
			photos = photos.map((photo) => (photo.match(/(?<=fbid=)\d+/) || [""])[0]);
			return photos;
		} catch (e) {
			console.error("Error while fetching photos", e, `Page was ${pageCount}`);
			console.log("Fetched photos", `Detected ${photos.length} photos`);
			// TODO: Register Error with data in BACKEND
		}
	}

	private async getPhotoURLs(photosIds: string[]) {
		const photoURLs: string[] = [];
		for (const id of photosIds) {
			try {
				const url = `https://mbasic.facebook.com/photo/view_full_size/?fbid=${id}`;
				const html = await this.connector.get(url);
				const photoURL = DEditor.findURLByText("here", html);
				if (photoURL) {
					photoURLs.push(photoURL);
				} else {
					// Check if user blocked
					const title = DEditor.getTitle(html);
					if (title.includes("Content Not Found") || title.includes("Y’re Temporarily Blocked")) {
						console.log("User blocked", id);
					}
				}
			} catch (e) {
				console.error("Error while fetching photo", e);
				// TODO: Register Error with data in BACKEND
			}
		}
		return photoURLs;
	}

	async getPhotos(name: string, userId: number) {
		const SeeAllURL = await this.getFullPhotos(userId);
		if (!SeeAllURL) return Utils.sendNotification("No photos found");

		const imagesIds = await this.getMorePhotos(SeeAllURL);

		if (!imagesIds) return Utils.sendNotification("No photos found");

		const photoURLs = await this.getPhotoURLs(imagesIds);
		if (photoURLs.length === 0)
			return Utils.sendNotification("Account Blocked, Please try again later");

		const zipURL = await Helpers.generateZip(photoURLs, userId);
		const Base64 = await Helpers.saveBlob(zipURL);
		const fileName = `${name}_${moment().unix().toString()}`;
		Utils.download(Base64, fileName, "zip");
	}
}

export default new CORSFacebook();
