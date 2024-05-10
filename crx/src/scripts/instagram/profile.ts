import { File, Instagram as I } from "@src/types";

import Connector from "../connector";
import DEditor from "../dom";
import Helpers from "../utils";
import { MessageTypes } from "@src/types/enums";
import Params from "./params";
import Tracker from "../tracker";
import _ from "underscore";
import moment from "moment";

class Instagram {
	private connector = new Connector();
	private _userId!: number;
	public get userId(): number {
		return this._userId;
	}
	public set userId(value: number) {
		this._userId = value;
	}
	private _username!: string;
	public get username(): string {
		return this._username;
	}
	public set username(value: string) {
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

	private PPTracker = new Tracker<I.PPTrackRequest>();
	private PostsTracker = new Tracker<I.PostsTrackRequest>();

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
		const startedAt = moment();
		try {
			const lastVisitedProfileRequest =
				await Helpers.getFromStorage<I.LastProfile>(
					MessageTypes.INSTAGRAM_PROFILE
				);

			if (!lastVisitedProfileRequest)
				throw new Error("No Profile Found, try to refresh the page");
			this.username = lastVisitedProfileRequest.username;
			this.userId = await this.getId();
			const posts = await this.getPosts();
			if (!posts) throw new Error("No posts found");

			const Links = this.paresPosts(posts);

			this.PostsTracker.data.filesCount = Links.length;

			const Blob = await Helpers.generateZip(Links, `${this.username}`);
			Helpers.download(Blob, `${this.username} Posts`, "zip");
		} catch (error) {
			if (error instanceof Error) {
				Helpers.sendMessage(MessageTypes.NOTIFICATION, {
					type: "error",
					content: error.message,
				});
				this.PostsTracker.error = {
					error: error,
					message: error.message,
				};
			}
		} finally {
			this.PostsTracker.data.timeInMs = moment().diff(
				startedAt,
				"milliseconds"
			);
			this.PostsTracker.send();
		}
	}
	private async FullSize() {
		const lastVisitedProfileRequest =
			await Helpers.getFromStorage<I.LastProfile>(
				MessageTypes.INSTAGRAM_PROFILE
			);

		if (!lastVisitedProfileRequest)
			throw new Error("No Profile Found, try to refresh the page");

		this.username = lastVisitedProfileRequest.username;
		this.userId = await this.getId();
		await this.view();
	}

	private async view() {
		const startedAt = moment();
		try {
		const currentUser = await Helpers.getCurrentInstagramUserId();

			const url = "https://www.instagram.com/graphql/query";

			const data = await this.connector.post<I.ViewResponse>(
				url,
				Params.SearchQueryParams(this.username, this.userId).toString(),
				"application/x-www-form-urlencoded",
				true,
				Params.SearchQueryHeaders
			);
			const res = data.json;

			if (!res) throw new Error("Couldn't get profile picture");
			const profilePicture = res.data.user.hd_profile_pic_url_info.url;
			this.PPTracker.data = {
				...this.PPTracker.data,
				eventName: "INSTAGRAM_PROFILE_PICTURE_VIEW",
				downloadType: "IMAGE",
				filesCount: 1,
				url: window.location.href,
				files: [
					{
						extension: "png",
						url: profilePicture,
						id: `${this.userId}`,
						fileName: `${this.username}`,
					},
				],
				payload: res.data.user,
				user: currentUser,
				owner: res.data.user,
				itemId: `${this.userId}`,
			};

			Helpers.openTab(profilePicture);
		} catch (err) {
			if (err instanceof Error) {
				Helpers.sendMessage(MessageTypes.NOTIFICATION, {
					type: "error",
					content: err.message,
				});
				this.PPTracker.error = {
					error: err,
					message: err.message,
				};
			}
		} finally {
			const endedAt = moment();
			this.PPTracker.data = {
				...this.PPTracker.data,

				timeInMs: endedAt.diff(startedAt, "milliseconds"),
			};

			this.PPTracker.send();
		}
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
		if (!res) throw new Error("Can't get user id");
		return +res.data.user.id;
	}

	private async getPosts() {
		let url = `https://www.instagram.com/api/v1/feed/user/${this.username}/username/?count=100`;
		let isHasNext = true;
		let posts: I.Post[] = [];
		while (isHasNext) {
			const res = (
				await this.connector.get<I.PostResponse>(url, true, {
					...Params.BasicHeaders,
				})
			).json;
			if (!res || res.items.length === 0) throw new Error("No posts found");

			posts = posts.concat(res.items);
			isHasNext = res.more_available;
			if (res.next_max_id) {
				const U = new URL(url);
				U.searchParams.set("max_id", res.next_max_id);
				url = U.toString();
			}
		}
		this.PostsTracker.data = {
			...this.PostsTracker.data,
			downloadType: "ARCHIVE",
			eventName: "INSTAGRAM_POSTS_ARCHIVE",
			user: await Helpers.getCurrentInstagramUserId(),
			url: window.location.href,
			owner: posts[0].user,
			payload: posts,
		};

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
						id: post.pk,
						width: post.image_versions2.candidates[0].width,
						height: post.image_versions2.candidates[0].height,
						fileName: `${this.username}_${post.code}_${index + 1}`,
					});
					break;
				case I.MediaTypes.VIDEO:
					Links.push({
						url: post.video_versions
							? post.video_versions[0].url
							: post.image_versions2.candidates[0].url,
						extension: "mp4",
						id: post.pk,
						width: post.video_versions ? post.video_versions[0].width : 0,
						height: post.video_versions ? post.video_versions[0].height : 0,
						fileName: `${this.username}_${post.code}_${index + 1}`,
					});
					break;
				case I.MediaTypes.CAROUSEL:
					{
						const media = post.carousel_media;
						if (!media) continue;
						media.forEach((m, i) => {
							Links.push({
								url:
									m.media_type === I.MediaTypes.IMAGE
										? m.image_versions2.candidates[0].url
										: m.video_versions
										? m.video_versions[0].url
										: m.image_versions2.candidates[0].url,
								extension: m.media_type === I.MediaTypes.IMAGE ? "png" : "mp4",
								fileName: `${this.username}_${i}_${index + 1}`,
								id: m.id,
								width: m.video_versions
									? m.video_versions[0].width
									: m.image_versions2.candidates[0].width,
								height: m.video_versions
									? m.video_versions[0].height
									: m.image_versions2.candidates[0].height,
							});
						});
					}
					break;
			}
		}

		this.PostsTracker.data.files = Links;

		return Links;
	}
}

export default new Instagram();
