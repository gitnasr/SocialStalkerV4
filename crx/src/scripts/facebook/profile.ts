import { Facebook as F, File } from "@src/types";

import DEditor from "../dom";
import Helpers from "../utils";
import { MessageTypes } from "@src/types/enums";
import Tracker from "../tracker";
import moment from "moment";

class Profile {
	private _observer: MutationObserver | undefined;
	private _name = "";
	private _wrapper = "social-stalker-fb-profile";
	private _userId = 0;
	private _url = "";
	private _username = "";
	private _tracker = new Tracker<F.ProfileTracker>();
	public get tracker() {
		return this._tracker;
	}
	public set tracker(value) {
		this._tracker = value;
	}
	public get wrapper(): string {
		return this._wrapper;
	}
	public set wrapper(value: string) {
		this._wrapper = value;
	}
	public get name(): string {
		return this._name;
	}
	public set name(value: string) {
		this._name = value;
	}

	public get username(): string {
		return this._username;
	}
	public set username(value: string) {
		this._username = value;
	}

	public get url(): string {
		return this._url;
	}
	public set url(value: string) {
		this._url = value;
	}

	public get userId(): number {
		return this._userId;
	}
	public set userId(value: number) {
		this._userId = value;
	}
	public set observer(value: MutationObserver | undefined) {
		this._observer = value;
	}
	public get observer(): MutationObserver | undefined {
		return this._observer;
	}

	constructor() {
		this.watch();

		chrome.runtime.onMessage.addListener((message) => {
			if (message.type === MessageTypes.STATE_CHANGE) {
				this.watch();
			}
		});
	}

	private addCustomButton(
		wrapper: HTMLElement,
		friendsButton: HTMLElement,
		text: string,
		clickHandler: () => void
	) {
		const buttonClone = friendsButton.cloneNode(true) as HTMLElement;
		const button = this.createCustomButton(text, buttonClone, clickHandler);

		wrapper.appendChild(button);
	}

	private createCustomButton(
		text: string,
		buttonClone: HTMLElement,
		clickHandler: () => void
	): HTMLElement {
		const spanElement = buttonClone.querySelector("span");
		if (spanElement) {
			spanElement.textContent = text;
		}
		const imgElement = buttonClone.querySelector("img");
		if (imgElement) {
			imgElement.parentElement?.remove();
		}

		buttonClone.addEventListener("click", clickHandler.bind(this));

		return buttonClone;
	}

	private async Boom() {
		if (DEditor.isInjected(this.wrapper)) return;
		const action_buttons = document.querySelectorAll(
			".x78zum5.x1a02dak.x139jcc6.xcud41i.x9otpla.x1ke80iy"
		);

		if (action_buttons.length === 0) return;

		// NOTE: First render may have disabled button
		const friendsButton = action_buttons[0].firstChild as HTMLElement;
		if (friendsButton.querySelector("div[aria-disabled='true']")) return;

		const wrapper = DEditor.createWrapperElement(this.wrapper, "wrapper");

		this.addCustomButton(
			wrapper,
			friendsButton,
			"Full Profile Picture",
			this.FullSize.bind(this)
		);
		this.addCustomButton(
			wrapper,
			friendsButton,
			"Download Photos",
			this.downloadAll.bind(this)
		);

		action_buttons[0].appendChild(wrapper);
	}
	private async downloadAll() {
		const startedAt = moment();
		try {
			const info = await this.getProfileInfo();
			if (!info) throw new Error("Profile info not found");
			const { userId, name } = info;
			this.userId = userId;
			this.name = name;
			const PhotosURLs = (await Helpers.sendMessage(
				MessageTypes.GET_FACEBOOK_ALBUMS,
				{ userId: this.userId },
				true
			)) as File[];
			this.tracker.data.payload = PhotosURLs;
			this.tracker.data.files = PhotosURLs;
			this.tracker.data.filesCount = PhotosURLs.length;
			const blob = await Helpers.generateZip(PhotosURLs, this.userId);
			Helpers.download(blob, `${this.name}_${this.userId}`, "zip");
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
			const timeInMs = moment().diff(startedAt, "milliseconds");
			this.tracker.data = {
				...this.tracker.data,
				eventName: "FACEBOOK_PROFILE_PHOTOS",
				url: window.location.href,
				timeInMs,
				downloadType: "ARCHIVE",
				owner: {
					id: this.userId.toString(),
					name: this.name,
				},
				itemId: null,
				user: await this.getCurrentFacebookId(),
			};
			this.tracker.send();
		}
	}
	private getProfileInfo = async () => {
		return Helpers.sendMessage(
			MessageTypes.GET_FACEBOOK_PROFILE,
			this.url,
			true
		) as F.Info;
	};
	private async FullSize() {
		const startedAt = moment();

		try {
			// NOTE: We need to get the profile info from Background Script because mbasic.facebook.com is has CORS issue.
			const info = await this.getProfileInfo();
			if (!info) throw new Error("Profile info not found");
			const { userId } = info;
			this.userId = userId;
			if (this.userId === 0) throw new Error("User ID not found");
			const url = `https://graph.facebook.com/${this.userId}/picture?width=4080&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
			const response = await fetch(url, { redirect: "follow" });
			const payload: File[] = [
				{
					url,
					extension: "png",
					fileName: `fb_${this.userId}`,
					id: this.userId.toString(),
				},
			];
			this.tracker.data.files = payload;
			this.tracker.data.payload = payload;
			const res = response.url;
			Helpers.openTab(res);
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
			const timeInMs = moment().diff(startedAt, "milliseconds");
			this.tracker.data = {
				...this.tracker.data,
				filesCount: 1,
				eventName: "FACEBOOK_PROFILE_PICTURE",
				url: window.location.href,
				timeInMs,
				downloadType: "IMAGE",
				owner: {
					id: this.userId.toString(),
					name: this.name,
				},
				itemId: this.userId.toString(),
				user: await this.getCurrentFacebookId(),
			};
			this.tracker.send();
		}
	}
	private watch() {
		const currentURL = window.location.href;
		this.url = currentURL;
		const isValid = this.validateURL();

		if (isValid) {
			this.Boom();
		}
		if (!this.observer) {
			this.observer = new MutationObserver((mutationsList) => {
				mutationsList.forEach(() => {
					if (!DEditor.isInjected(this.wrapper)) {
						return this.Boom();
					}
				});
			});
			this.observer.observe(document.body, {
				subtree: true,
				childList: true,
				attributes: false,
			});
		}
	}
	private validateURL() {
		const url = new URL(this.url);
		const { pathname, searchParams } = url;
		const pathNamesToCheck = [
			"/profile.php",
			"memories",
			"/groups",
			"/pages",
			"/events",
			"/photos",
			"/watch",
			"/posts",
			"/messages",
			"/gaming",
			"/friends",
		];

		if (pathNamesToCheck.some((checkPath) => pathname.startsWith(checkPath))) {
			if (pathname === "/profile.php") {
				const userId = searchParams.get("id");
				if (userId) {
					this.userId = parseInt(userId);
					this.username = userId;
					return true;
				}
			}
			this.username = "";
			this.userId = 0;
			return false;
		} else {
			const username = pathname.split("/")[1];
			this.username = username;
			return true;
		}
	}

	private getCurrentFacebookId = async () => {
		const userId = await Helpers.sendMessage(
			MessageTypes.GET_COOKIE,
			{
				url: "https://facebook.com",
				name: "c_user",
			},
			true
		);

		return userId as string;
	};
}

export default new Profile();
