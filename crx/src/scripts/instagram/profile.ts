import { File, Instagram as I } from "@src/types";

import Connector from "../connector";
import DEditor from "../dom";
import Helpers from "../utils";
import { MessageTypes } from "@src/types/enums";
import Params from "./params";
import _ from "underscore";

class Instagram {
	private connector = new Connector();
	private _userId: number | undefined;
	public get userId(): number | undefined {
		return this._userId;
	}
	public set userId(value: number | undefined) {
		this._userId = value;
	}
	private _username: string | undefined;
	public get username(): string | undefined {
		return this._username;
	}
	public set username(value: string | undefined) {
		this._username = value;
	}
	private observer: MutationObserver | undefined;
	private _wrapperName = "social-stalker-insta-profile";
	public get wrapperName(): string {
		return this._wrapperName;
	}
	public set wrapperName(value: string) {
		this._wrapperName = value;
	}
	private wrapperElement: HTMLElement | undefined;
	constructor() {
		this.watch();
		chrome.runtime.onMessage.addListener((message) => {
			if (message.type === MessageTypes.STATE_CHANGE) {
				if (message.data.url.includes("instagram.com")) {
					this.watch();
				}
			}
		});
	}
	private addCustomButton(
		actionButtons: HTMLElement,
		text: string,
		clickHandler: () => void
	) {
		const buttonClone = actionButtons?.firstChild?.cloneNode(
			true
		) as HTMLElement;
		const button = this.createCustomButton(text, buttonClone, clickHandler);

		this.wrapperElement?.appendChild(button);
	}

	private createCustomButton(
		text: string,
		buttonClone: HTMLElement,
		clickHandler: () => void
	): HTMLElement {
		if (!buttonClone.lastElementChild) return buttonClone;
		buttonClone.lastElementChild.textContent = text;
		buttonClone.addEventListener("click", clickHandler.bind(this));

		return buttonClone;
	}
	private Boom() {
		try {
			this.wrapperElement = DEditor.createWrapperElement(
				this.wrapperName,
				"wrapper"
			);

			const action_buttons = document.querySelectorAll(
				Params.Selectors().actionButtons
			);

			if (action_buttons.length === 0) return;

			const lastChildInActionButtons = _.last(action_buttons) as HTMLElement;
			if (!lastChildInActionButtons) return;
			this.addCustomButton(
				lastChildInActionButtons,
				"View Full Profile Picture",
				this.FullSize
			);
			this.addCustomButton(
				lastChildInActionButtons,
				"Download All",
				this.downloadAll
			);

			const bioSection = document.querySelector(Params.Selectors().bioSection);

			bioSection?.appendChild(this.wrapperElement);
		} catch (e) {
			console.log(e);
		}
	}
	private async downloadAll() {
		const lastVisitedProfileRequest =
			await Helpers.getFromStorage<I.LastProfile>(
				MessageTypes.INSTAGRAM_PROFILE
			);

		if (!lastVisitedProfileRequest) return;

		this.username = lastVisitedProfileRequest.username;
		this.userId = await this.getId();
		const posts = await this.getPosts();
		if (!posts) return;
		const Links = this.paresPosts(posts);
		const Blob = await Helpers.generateZip(Links, `${this.username}`);
		Helpers.download(Blob, `${this.username} Posts`, "zip");
	}
	private async FullSize() {
		const lastVisitedProfileRequest =
			await Helpers.getFromStorage<I.LastProfile>(
				MessageTypes.INSTAGRAM_PROFILE
			);

		if (!lastVisitedProfileRequest) return;
		this.username = lastVisitedProfileRequest.username;
		this.userId = await this.getId();
		this.view();

		// TODO: Some Tracking !!
	}

	private async view() {
		const url = "https://www.instagram.com/graphql/query";

		const data = await this.connector.post<I.ViewResponse>(
			url,
			Params.SearchQueryParams(this.username!, this.userId!).toString(),
			"application/x-www-form-urlencoded",
			true,
			Params.SearchQueryHeaders
		);
		const res = data.json;
		if (!res) return;
		const profilePicture = res.data.user.hd_profile_pic_url_info.url;
		Helpers.openTab(profilePicture);
	}

	private watch() {
		if (!this.observer) {
			this.observer = new MutationObserver((mutations) => {
				mutations.forEach(() => {
					if (DEditor.isInjected(this.wrapperName)) {
						return;
					}
					this.Boom();
				});
			});
			this.observer.observe(document, {
				subtree: true,
				childList: true,
			});
		}
	}

	private async getId() {
		const req = await this.connector.get<I.SearchResponse>(
			`https://www.instagram.com/api/v1/users/web_profile_info/?username=${this.username}`,
			true,
			{ ...Params.BasicHeaders }
		);

		const res = req.json;
		if (!res) return;
		return +res.data.user.id;
	}

	private async getPosts() {
		let url = `https://www.instagram.com/api/v1/feed/user/${this.username}/username/?count=33`;
		let isHasNext = true;
		let posts: I.Post[] = [];
		while (isHasNext) {
			const res = (
				await this.connector.get<I.PostResponse>(url, true, {
					...Params.BasicHeaders,
				})
			).json;
			if (!res) return;
			posts = posts.concat(res.items);
			isHasNext = res.more_available;
			if (res.next_max_id) url = `${url}&max_id=${res.next_max_id}`;
		}
		return posts;
	}

	private paresPosts(posts: I.Post[]) {
		const Links: File[] = [];
		for (let index = 0; index < posts.length; index++) {
			const post = posts[index];
			const type = post.media_type;
			switch (type) {
				case I.MediaTypes.IMAGE:
					Links.push({
						url: post.image_versions2.candidates[0].url,
						extension: "png",
					});
					break;
				case I.MediaTypes.VIDEO:
					Links.push({
						url: post.video_versions
							? post.video_versions[0].url
							: post.image_versions2.candidates[0].url,
						extension: "mp4",
					});
					break;
				case I.MediaTypes.CAROUSEL:
					{
						const media = post.carousel_media;
						if (!media) continue;
						media.forEach((m,i) => {
							Links.push({
								url:
									m.media_type === I.MediaTypes.IMAGE
										? m.image_versions2.candidates[0].url
										: m.video_versions
										? m.video_versions[0].url
										: m.image_versions2.candidates[0].url,
								extension: m.media_type === I.MediaTypes.IMAGE ? "png" : "mp4",
								fileName: `${this.username}_${post.code}_${i}_${index + 1}`,
							});
						});
					}
					break;
			}
		}
		return Links;
	}
}

export default new Instagram();
