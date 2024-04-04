import DEditor from "../dom";
import Helpers from "../helper";
import { Instagram as I } from "@src/types";
import { MessageTypes } from "@src/types/enums";
import Params from "./params";
import _ from "underscore";

class Instagram {
	private divs: Record<string, string>;
	private observer: MutationObserver | undefined;
	private wrapper: string;

	constructor() {
		this.wrapper = "social-stalker-insta-profile-download";
		this.divs = {
			action_buttons:
				".x9f619 xjbqb8w x78zum5 x168nmei x13lgxp2 x5pf9jr xo71vjh x1n2onr6 x1plvlek xryxfnj x1c4vz4f x2lah0s x1q0g3np xqjyukv x1qjc9v5 x1oa3qoh x1nhvcw1".replace(
					/ /g,
					"."
				),
		};
		// Handle First Render of the page
		this.watch();
		chrome.runtime.onMessage.addListener(({ message }) => {
			if (message.type === MessageTypes.STATE_CHANGE) {
				if (message.data.url.includes("instagram.com")) {
					this.watch();
				}
			}
		});
	}
	private injectDiv() {
		try {
			// check if injected
			const wrapper = DEditor.createWrapperElement(this.wrapper, "wrapper");


			// if (document.getElementById("view-full-profile-picture")) return;

			const action_buttons = document.querySelectorAll(
				this.divs.action_buttons
			);

			if (action_buttons.length === 0) return;

			const lastChildInActionButtons = _.last(action_buttons);
			const FullSize = lastChildInActionButtons?.firstChild?.cloneNode(
				true
			) as HTMLElement;

			if (FullSize && FullSize.lastChild) {
				FullSize.lastChild.textContent = "View Full Profile Picture";
				FullSize.addEventListener("click", this.FullSize.bind(this));
				wrapper.appendChild(FullSize);
			}

			const DownloadAll = lastChildInActionButtons?.firstChild?.cloneNode(
				true
			) as HTMLElement;
			if (DownloadAll && DownloadAll.lastChild) {
				DownloadAll.lastChild.textContent = "Download All";
				DownloadAll.addEventListener("click", this.downloadAll.bind(this));
				wrapper.appendChild(DownloadAll);
			}

			action_buttons[1].appendChild(wrapper);

		} catch (e) {
			console.log(e);
		}
	}
	private async downloadAll() {
		console.log("Download All");
		
	}
	private async FullSize() {
		const lastVisitedProfileRequest =
			await Helpers.getFromStorage<I.LastProfile>(
				MessageTypes.INSTAGRAM_PROFILE
			);

		if (!lastVisitedProfileRequest) return;
		const username = lastVisitedProfileRequest.username;
		const userId = lastVisitedProfileRequest.userId;
		if (username && !userId) {
			const id = await this.getId(username);
			this.view(id, username);
		}

		// TODO: Some Tracking !!
	}

	private async view(userId: number, username: string) {
		const url = "https://www.instagram.com/graphql/query";

		const options = {
			method: "POST",
			headers: Params.SearchQueryHeaders,
			body: Params.SearchQueryParams(username, userId).toString(),
		};
		const data = await fetch(url, options);
		const res = await data.json();
		const profilePicture = res.data.user.hd_profile_pic_url_info.url;
		chrome.runtime.sendMessage({
			type: MessageTypes.OPEN_TAB,
			data: profilePicture,
		});
	}

	

	private watch() {
		if (!this.observer) {
			this.observer = new MutationObserver((mutations) => {
			
				mutations.forEach(() => {
					if (DEditor.isInjected(this.wrapper)) {
						return;
					}
					this.injectDiv();
				});
			});
			this.observer.observe(document, {
				subtree: true,
				childList: true,
			});
		}
	}

	private async getId(username: string) {
		const res = await fetch(
			`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
			{
				headers: {
					"x-asbd-id": "46548741",
					"X-IG-App-ID": "936619743392459",
				},
			}
		);
		const data = await res.json();
		return +data.data.user.id;
	}
}

export default new Instagram();
