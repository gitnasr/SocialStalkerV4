import Connector from "../connector";
import DEditor from "../dom";
import Helpers from "../helper";
import Utils from "../../background/utils";
import _ from "underscore";
import moment from "moment";

class Facebook {
	private url: string;
	private username: string;
	private Connection: Connector;
	private domain: string;
	private regex: Record<string, RegExp>;
	private name: string;
	private userId: number;
	constructor(url: string) {
		this.url = url;
		this.username = "";
		this.name = "Facebook User";
		this.domain = "https://mbasic.facebook.com";

		this.Connection = new Connector();
		this.regex = {
			photo: /(?<=fbid=)\d+/,
			user_id: /owner_id=(\d+)/,
		};
		this.userId = 0;
	}

	private async getBasicInfo() {
		let username = this.url.split("/")[3];
		let userId = 0;
		if (username.includes("?id=")) {
			const u = new URL(this.url);
			username = u.searchParams.get("id") || "";
			username = username.split("&")[0]
		
		}

		const isUsernameNumeric = /^\d+$/.test(username);
		let url;
		if (isUsernameNumeric) {
			url = `${this.domain}/profile.php?id=${username}`;
			this.username = username;
			userId = parseInt(username);
		} else {
			url = `${this.domain}/${username}`;
			this.username = username;
		}
		const html = await this.Connection.get(url);
		const title = DEditor.getTitle(html);
		this.name = title;

		const userIdResult = this.regex.user_id.exec(html);
		if (!userId && userIdResult) {
			userId = parseInt(userIdResult[1]);
		}
		this.userId = userId;
		console.log("Basic Info", this.username, this.userId, this.name);
	}

	private async getFullPhotos(): Promise<string | undefined> {
		const url = `${this.domain}/profile.php?id=${this.userId}&v=photos`;
		const html = await this.Connection.get(url);
		const partialSeeAllURL = DEditor.findURLByText("See All", html);
		if (partialSeeAllURL) {
			return `${this.domain}${partialSeeAllURL}`;
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
				const html = await this.Connection.get(current_url);
				const photoElements = DEditor.findLinkByClass("s", html);
				photos = photos.concat(...photoElements);

				const lastElement = _.last(photoElements);
				if (lastElement && !lastElement.includes("?owner_id=")) {
					isHasNext = false;
					break;
				}
				current_url = `${this.domain}${lastElement}`;
				photos.pop();
			}
			console.log("No more photos", `Detected ${photos.length} photos`, photos);
			photos = photos.map((photo) => {
				const id = photo.match(this.regex.photo);
				if (id) {
					return id[0];
				}
				return "";
			});
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
				const url = `${this.domain}/photo/view_full_size/?fbid=${id}`;
				const html = await this.Connection.get(url);
				const photoURL = DEditor.findURLByText("here", html);
				if (photoURL) {
					photoURLs.push(photoURL);
				} else {
					// Check if user blocked
					const title = DEditor.getTitle(html);
					if (title.includes("Content Not Found")) {
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

	async getPhotos() {
		await this.getBasicInfo();

		const SeeAllURL = await this.getFullPhotos();
		if (!SeeAllURL) return Utils.sendNotification("No photos found");

		const imagesIds = await this.getMorePhotos(SeeAllURL);

		if (!imagesIds) return Utils.sendNotification("No photos found");

		const photoURLs = await this.getPhotoURLs(imagesIds);
		if (photoURLs.length === 0)
			return Utils.sendNotification("No photos found");

		const zipURL = await Helpers.generateZip(photoURLs, this.userId);
		const Base64 = await Helpers.saveBlob(zipURL);
		const fileName = `${this.name}_${moment().unix().toString()}`
		Utils.download(Base64, fileName, "zip");
	
		
	}
	async getProfilePicture() {
		await this.getBasicInfo();

		chrome.tabs.create({ url: "src/pages/options/index.html" });

		const url = `https://graph.facebook.com/${this.userId}/picture?width=4072&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
		return url;
	}
}

export default Facebook;
