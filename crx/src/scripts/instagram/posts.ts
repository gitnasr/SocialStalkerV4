import { File, Instagram as I } from "@src/types";

import Connector from "../connector";
import DEditor from "../dom";
import DownloadIcon from "@assets/icons/download.svg";
import Helpers from "../utils";
import { MessageTypes } from "@src/types/enums";
import Params from "./params";
import ZipIcon from "@assets/icons/zip.svg";

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

	constructor() {
		console.log("Posts class initialized");
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
		try {
			const currentURL = window.location.href;
			if (!currentURL.includes("instagram.com/p/")) return;
			const isInjected = DEditor.isInjected(this.wrapperName);
			if (isInjected) return;
			this.type = "Single";
			this.wrapperElement = DEditor.createWrapperElement(
				this.wrapperName,
				"wrapper"
			);

			const SaveButton = document.querySelector(
				Params.Selectors().saveButton
			) as HTMLElement;
			const Parent = DEditor.getNthParent(SaveButton, 6) as HTMLElement;

			this.addCustomButton(DownloadIcon, Parent, () => this.download());

			const carousal = window.location.href.includes("img_index");
			if (carousal) {
				this.addCustomButton(ZipIcon, Parent, () => {
					this.type = "Zip";
					this.download();
				});
			}

			Parent.appendChild(this.wrapperElement);
		} catch (e) {
			console.log(e);
		}
	}

	private async download() {
		const postURL = new URL(window.location.href);
		const postId = postURL.pathname.split("/p/")[1].split("/")[0];
		const url = `https://www.instagram.com/p/${postId}/?__a=1&__d=dis`;

		const res = (await this.connector.get<I.PostResponse>(url, true)).json;
		if (!res) return;
		if (res.num_results === 0) return;
		const Media = res.items[0];
		const type = Media.media_type;
		const { username } = Media.user;
		if (type === I.MediaTypes.IMAGE) {
			const media = Media.image_versions2.candidates[0].url;
			return Helpers.openTab(media);
		}
		if (type === I.MediaTypes.VIDEO) {
			const media = Media.video_versions
				? Media.video_versions[0].url
				: Media.image_versions2.candidates[0].url;

			return Helpers.download(media, `${username}_${postId}`, "mp4");
		}
		if (type === I.MediaTypes.CAROUSEL) {
			if (this.type === "Zip") {
				const media = Media.carousel_media;
				if (!media) return;
				const links: File[] = media.map((m) => {
					return {
						url: I.MediaTypes.IMAGE
							? m.image_versions2.candidates[0].url
							: m.video_versions
							? m.video_versions[0].url
							: m.image_versions2.candidates[0].url,
						extension: I.MediaTypes.IMAGE ? "png" : "mp4",
						fileName: `${username}_${postId}`,
					};
				});
				const ZipURL = await Helpers.generateZip(links, username);
				return Helpers.download(ZipURL, `${username}_${postId}`, "zip");
			}

			const postURL = new URL(window.location.href);
			const currentImage = postURL.searchParams.get("img_index");

			const index = currentImage ? parseInt(currentImage) : 1;

			const media = Media?.carousel_media
				? Media.carousel_media[index - 1]
				: undefined;
			if (!media) return;
			if (media.media_type === I.MediaTypes.IMAGE) {
				Helpers.openTab(media.image_versions2.candidates[0].url);
			}
			if (media.media_type === I.MediaTypes.VIDEO) {
				Helpers.download(
					media.video_versions
						? media.video_versions[0].url
						: media.image_versions2.candidates[0].url,
					`${username}_${postId}`,
					"mp4"
				);
			}
		}
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
