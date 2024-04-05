import DEditor from "../dom";
import { Facebook as F } from "@src/types";
import Helpers from "../helper";
import { MessageTypes } from "@src/types/enums";
import UnlockIcon from "@assets/icons/unlock.svg";
import ZipIcon from "@assets/icons/zip.svg";

class Profile {
	private _observer: MutationObserver | undefined;
	private _name = "";
	private _wrapper = "social-stalker-fb-profile";
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
	private _userId = 0;
	private _url = "";
	private _username = "";
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

		chrome.runtime.onMessage.addListener(({ message }) => {
			if (message.type === "STATE_CHANGE") {
				this.watch();
			}
		});
	}

	private addCustomButton(
		wrapper: HTMLElement,
		friendsButton: HTMLElement,
		text: string,
		iconUrl: string,
		clickHandler: () => void
	) {
		const buttonClone = friendsButton.cloneNode(true) as HTMLElement;
		const button = this.createCustomButton(
			text,
			iconUrl,
			buttonClone,
			clickHandler
		);

		wrapper.appendChild(button);
	}

	private createCustomButton(
		text: string,
		iconUrl: string,
		buttonClone: HTMLElement,
		clickHandler: () => void
	): HTMLElement {
		const spanElement = buttonClone.querySelector("span");
		if (spanElement) {
			spanElement.textContent = text;
		}
		const imgElement = buttonClone.querySelector("img");
		if (imgElement) {
			imgElement.src = chrome.runtime.getURL(iconUrl);
			imgElement.removeAttribute("class");
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
			"View Full Profile Picture",
			UnlockIcon,
			this.FullSize.bind(this)
		);
		this.addCustomButton(
			wrapper,
			friendsButton,
			"Download All",
			ZipIcon,
			this.downloadAll.bind(this)
		);

		action_buttons[0].appendChild(wrapper);
	}
	private async downloadAll() {
		const info = await this.getProfileInfo();
		const { userId, name } = info;
		this.userId = userId;
		this.name = name;
		Helpers.sendMessage(MessageTypes.GET_FACEBOOK_ALBUMS, {
			userId: this.userId,
			name: this.name,
		});
	}
	private getProfileInfo = async () => {
		const info = await new Promise<F.Info>((resolve) => {
			chrome.runtime.sendMessage(
				{ type: MessageTypes.GET_FACEBOOK_PROFILE, data: this.url },
				(response) => {
					resolve(response);
				}
			);
		});
		return info;
	};
	private async FullSize() {
		// NOTE: We need to get the profile info from Background Script because mbasic.facebook.com is has CORS issue.
		const info = await this.getProfileInfo();
		const { userId } = info;
		this.userId = userId;

		const url = `https://graph.facebook.com/${this.userId}/picture?width=4072&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
		chrome.runtime.sendMessage({ type: MessageTypes.OPEN_TAB, data: url });
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
}

export default new Profile();
