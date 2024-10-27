import { File, Instagram as I } from "@src/types";

import Connector from "../connector";
import DEditor from "../dom";
import DownloadIcon from "@assets/icons/download.svg";
import Helpers from "../utils";
import { MessageTypes } from "@src/types/enums";
import Params from "./params";
import Tracker from "../tracker";
import ZipIcon from "@assets/icons/zip.svg";
import moment from "moment";

class Posts {
	private connector = new Connector();
	private _postId: string | undefined;
	public get postId(): string | undefined {
		return this._postId;
	}
	public set postId(value: string | undefined) {
		this._postId = value;
	}
	private _type: "Zip" | "Single" = "Single";
	public get type(): string | undefined {
		return this._type;
	}
	public set type(value: "Zip" | "Single") {
		this._type = value;
	}

	private _observer: MutationObserver | undefined;
	public get observer(): MutationObserver | undefined {
		return this._observer;
	}
	public set observer(value: MutationObserver | undefined) {
		this._observer = value;
	}

	private _wrapperName = "social-stalker-insta-posts";
	public get wrapperName(): string {
		return this._wrapperName;
	}
	public set wrapperName(value: string) {
		this._wrapperName = value;
	}
	private wrapperElement: HTMLElement | undefined;

	private tracker = new Tracker<I.PostTrackRequest>();

	constructor() {
		this.Boom();
		chrome.runtime.onMessage.addListener((message) => {
			if (message.type === MessageTypes.STATE_CHANGE) {
				if (message.data.url.includes("instagram.com/p/")) {
					this.watch();
				} else {
					if (this.observer) {
						this.observer.disconnect();
						this.observer = undefined;
						DEditor.detachButton(this.wrapperName);
					}
				}
			}
		});
	}
	addCustomButton(iconUrl: string, parent: HTMLElement, callback: () => void) {
		const button = parent?.lastChild?.cloneNode(true) as HTMLElement;
		const image = document.createElement("img");
		image.src = chrome.runtime.getURL(iconUrl);
		image.className = "btn";
		const buttonSVG = button.querySelector("svg");
		const buttonParent = buttonSVG?.parentElement?.parentElement;
		buttonSVG?.remove();
		buttonParent?.appendChild(image);
		button.addEventListener("click", callback);
		this.wrapperElement?.appendChild(button);
	}
	private Boom() {
		const currentURL = window.location.href;
		if (!currentURL.includes("instagram.com/p/")) return;
		const isInjected = DEditor.isInjected(this.wrapperName);
		if (isInjected) return;

		this.wrapperElement = DEditor.createWrapperElement(
			this.wrapperName,
			"wrapper"
		);

		const SaveButton = document.querySelector(
			Params.Selectors().saveButton
		) as HTMLElement;
		const Parent = DEditor.getNthParent(SaveButton, 6) as HTMLElement;

		this.addCustomButton(DownloadIcon, Parent, () => {
			this.type = "Single";
			this.download();
		});

		const carousal = window.location.href.includes("img_index");
		if (carousal) {
			this.addCustomButton(ZipIcon, Parent, () => {
				this.type = "Zip";
				this.download();
			});
		}

		Parent.appendChild(this.wrapperElement);
	}

	private async download() {
		const startedAt = moment();

		try {
			const postURL = new URL(window.location.href);
			const postId = postURL.pathname.split("/p/")[1].split("/")[0];
			const url = `https://www.instagram.com/p/${postId}/?__a=1&__d=dis`;

			const res = (await this.connector.get<I.PostResponse>(url, true)).json;
			if (!res) throw new Error("No response from Instagram");
			if (res.num_results === 0) throw new Error("No media found in the post");
			const Media = res.items[0];
			const type = Media.media_type;
			const { username } = Media.user;
			this.tracker.data = {
				...this.tracker.data,
				user: await Helpers.getCurrentInstagramUserId(),
				payload: Media,
				url: window.location.href,
				owner: Media.user,
				eventName: "INSTAGRAM_POST_DOWNLOAD",
				itemId: postId,
				filesCount: 1,
			};
			if (type === I.MediaTypes.IMAGE) {
				const media = Media.image_versions2.candidates[0].url;
				this.tracker.data.downloadType = "IMAGE";

				this.tracker.data.files = [
					{
						url: media,
						extension: "png",
						id: postId,
						width: Media.image_versions2.candidates[0].width,
						height: Media.image_versions2.candidates[0].height,
						fileName: `${username}_${postId}`,
					},
				];
				return Helpers.openTab(media);
			}
			if (type === I.MediaTypes.VIDEO) {
				const media = Media.video_versions
					? Media.video_versions[0]
					: Media.image_versions2.candidates[0];
				this.tracker.data.downloadType = "VIDEO";
				this.tracker.data.files = [
					{
						url: media.url,
						extension: "mp4",
						id: postId,
						fileName: `${username}_${postId}`,
						width: media.height,
						height: media.width,
					},
				];
				return Helpers.download(media.url, `${username}_${postId}`, "mp4");
			}
			if (type === I.MediaTypes.CAROUSEL) {
				this.tracker.data.filesCount = Media.carousel_media_count || 1;
				if (!Media.carousel_media) throw new Error("No carousel media found");
				const CarousalItems = this.handleCarousel(Media.carousel_media);
				this.tracker.data.files = CarousalItems;

				if (this.type === "Zip") {
					const ZipURL = await Helpers.generateZip(CarousalItems, username);
					this.tracker.data.itemId = null;
					this.tracker.data.downloadType = "ARCHIVE";
					return Helpers.download(ZipURL, `${username}_${postId}`, "zip");
				}

				const postURL = new URL(window.location.href);
				const currentImage = postURL.searchParams.get("img_index");

				const index = currentImage ? parseInt(currentImage) : 1;

				const media = CarousalItems ? CarousalItems[index - 1] : undefined;
				if (!media) throw new Error("No carousal item found");
				if (media.extension === "png") {
					this.tracker.data.downloadType = "IMAGE";
					Helpers.openTab(media.url);
				}
				if (media.extension === "mp4") {
					this.tracker.data.downloadType = "VIDEO";
					Helpers.download(media.url, `${username}_${postId}`, "mp4");
				}
				this.tracker.data.itemId = media.id;
			}
		} catch (error) {
			if (error instanceof Error) {
				Helpers.sendMessage(MessageTypes.NOTIFICATION, {
					type: "error",
					content: error.message,
				});
				this.tracker.error = {
					error,
					message: error.message,
				};
			}
		} finally {
			this.tracker.data.timeInMs = moment().diff(startedAt, "milliseconds");
			this.tracker.send();
		}
	}

	private handleCarousel(media: I.CarouselMedia[]) {
		const links: File[] = media.map((m) => {
			const item = m.media_type === I.MediaTypes.IMAGE ? m.image_versions2.candidates : m.video_versions;
			if (!item || item.length == 0) throw new Error("No media found in carousel item");
		
			return {
				url: item[0].url,
				width: item[0].width,
				height: item[0].height,
				id: m.id,
				extension:  m.media_type === I.MediaTypes.IMAGE ? "png" : "mp4",
				fileName: m.id,
			};
		});
		return links;
	}

	private watch() {
		if (!this.observer) {
			this.observer = new MutationObserver((mutations) => {
				mutations.forEach(() => {
					if (DEditor.isInjected(this.wrapperName)) return;
					this.Boom();
				});
			});
			this.observer.observe(document, {
				subtree: true,
				childList: true,
			});
		}
	}
}

export default new Posts();
