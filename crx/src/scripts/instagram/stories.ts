import { ButtonTypes, File, Instagram as I } from "@src/types";

import DEditor from "../dom";
import DownloadIcon from "@assets/icons/download.svg";
import DownloadVideo from "@assets/icons/download_video.svg";
import Helpers from "../utils";
import { MessageTypes } from "@src/types/enums";
import Tracker from "../tracker";
import ZipIcon from "@assets/icons/zip.svg";
import moment from "moment";

class Stories {
	private wrapper: string;
	private observer: MutationObserver | undefined;
	private StoryTypes: I.StoryTypes = "reel";
	private _currentUser = "unknown";
	private tacker = new Tracker<I.StoryTrackRequest>();

	public get currentUser(): string {
		return this._currentUser;
	}
	public set currentUser(value: string) {
		this._currentUser = value;
	}
	constructor() {
		this.wrapper = "social-stalker-insta-download";
		this.Boom();
	}

	set setStoryType(type: "story" | "reel" | "highlight") {
		this.StoryTypes = type;
	}

	get getStoryType() {
		return this.StoryTypes;
	}

	private async Boom() {
		const currentURL = window.location.href;

		if (currentURL.includes("stories")) {
			this.watch();
		}

		chrome.runtime.onMessage.addListener((message) => {
			if (message.type === MessageTypes.STATE_CHANGE) {
				if (message.data.url.includes("stories")) {
					this.watch();
				}
			}
		});
	}

	private prepareDownloadButton() {
		const wrapper = DEditor.createWrapperElement(this.wrapper, "wrapper");

		const imageButton = DEditor.createDownloadButton(
			"download-as-image",
			DownloadIcon,
			"image",
			this.download.bind(this)
		);
		wrapper.appendChild(imageButton);

		// Check if there's a video element
		const isHasVideo = document.querySelector("video");
		if (isHasVideo) {
			// Create an image button for downloading as video
			const videoButton = DEditor.createDownloadButton(
				"download-as-video",
				DownloadVideo,
				"video",
				this.download.bind(this)
			);
			wrapper.appendChild(videoButton);
		}

		// Determine if there are multiple stories
		const storyCount = this.getStoryCount();
		if (storyCount > 1) {
			// Create an image button for downloading all as zip
			const downloadAllButton = DEditor.createDownloadButton(
				"download-all",
				ZipIcon,
				"zip",
				this.download.bind(this)
			);
			wrapper.appendChild(downloadAllButton);
		}

		// Find the parent element for appending the wrapper
		const parent = DEditor.findParentForAppending(3, 'svg[aria-label="Pause"]');
		if (!parent) return;
		parent.appendChild(wrapper);
	}

	private getStoryCount() {
		const quires = {
			q1: document.getElementsByClassName("x1ned7t2 x78zum5"),
			q2: document.getElementsByClassName("_ac3r"),
		};
		return quires.q1.length > 0
			? quires.q1[0].children.length
			: quires.q2.length > 0
			? quires.q2[0].children.length
			: 1;
	}

	private watch() {
		if (!this.observer) {
			this.observer = new MutationObserver((mutations) => {
				mutations.forEach(() => {
					if (!DEditor.isInjected(this.wrapper)) {
						this.prepareDownloadButton();
						return;
					}
				});
			});

			this.observer.observe(document, {
				subtree: true,
				childList: true,
			});
		}
	}
	private getUserFromUrl(input: string) {
		try {
			const url = new URL(input);
			const path = url.pathname;
			const pathParts = path.split("/");
			return {
				username: pathParts[2],
				type: input.includes("highlights") ? "highlight" : "story",
				id: pathParts[3],
			};
		} catch (error) {
			return null;
		}
	}
	private async download(type: ButtonTypes) {
		const startedAt = moment();

		try {
			const firstSeenStory = await Helpers.getFromStorage<I.StoryGraphQl>(
				MessageTypes.INSTAGRAM_STORY_SEEN
			);

			if (!firstSeenStory) throw new Error("Story not found");
			const vars = JSON.parse(
				firstSeenStory.variables as string
			) as I.StoryRequestVariables;
			const reelId = vars.reelId;
			let currentId = vars.reelMediaId;
			const owner = vars.reelMediaOwnerId;

			const urlData = this.getUserFromUrl(window.location.href);
			if (!urlData) return;
			const { type: StoryType, id } = urlData;

			if (StoryType === "story" && id && id !== currentId) {
				currentId = id;
				console.log("User got back to the same story");
			}

			let story: I.ShortStory | I.ShortStory[] = [];
			let storyId = BigInt(owner);

			this.setStoryType = "story";
			this.tacker.data.eventName = "INSTAGRAM_STORY_DOWNLOAD";
			this.tacker.data.filesCount = 1;

			if (reelId.includes("highlight")) {
				storyId = BigInt(reelId.split(":")[1]);
				this.setStoryType = "highlight";
				this.tacker.data.eventName = "INSTAGRAM_HIGHLIGHT_DOWNLOAD";
			}
			if (type === "zip") {
				story = (await this.getStory(storyId)) as I.ShortStory[];

				const links: File[] = story.map((item: I.ShortStory) => ({
					url: item.isVideo ? item.video! : item.image,
					extension: item.isVideo ? "mp4" : "png",
					id: item.id,
					fileName: `${this.currentUser}_${item.id}_${moment().unix()}`,
				}));

				const zipURL = await Helpers.generateZip(links, this.currentUser);

				const fileName = `${this.currentUser}_${
					this.getStoryType
				}_${moment().unix()}.zip`;
				this.tacker.data.downloadType = "ARCHIVE";
				this.tacker.data.itemId = null;
				this.tacker.data.filesCount = links.length;

				// TODO: Add Ability to download videos as photo if user asked (from options page user has to select this option)
				return Helpers.download(zipURL, fileName, "zip");
			}
			const cached = await Helpers.getFromStorage<I.StoryCache>(
				MessageTypes.INSTA_HIGHLIGH_CACHE
			);
			if (
				cached &&
				this.getStoryType === "highlight" &&
				BigInt(cached.highlightId) === storyId
			) {
				story = this.filterStories(cached.items, currentId);
			} else {
				story = await this.getStory(storyId, currentId);
			}
			if (!Array.isArray(story)) {
				this.tacker.data.itemId = story.id;

				if (type === "image") {
					this.tacker.data.downloadType = story.isVideo
						? "VIDEO_AS_IMAGE"
						: "IMAGE";
					Helpers.openTab(story.image);
				} else {
					if (!story.isVideo || !story.video) {
						return;
					}

					this.tacker.data.downloadType = "VIDEO";
					Helpers.download(story.video, currentId, "mp4");
				}
			}
		} catch (error) {
			console.error("Error while downloading story", error);
			Helpers.sendMessage(MessageTypes.NOTIFICATION, {
				type: "error",
				content: "Error while downloading story",
			});
		} finally {
			this.tacker.data.timeInMs = moment().diff(startedAt, "milliseconds");
			this.tacker.data.url = window.location.href;
			this.tacker.send();
		}
	}
	private filterStories(
		items: I.Story[],
		currentId: string | undefined
	): I.ShortStory | I.ShortStory[] {
		if (!currentId) {
			const stories = items.map((item: I.Story) => this.parseStory(item));
			return stories as I.ShortStory[];
		}
		const currentStory = items.find((item: I.Story) => item.pk === currentId);
		if (!currentStory) throw new Error("Story not found");
		const story = this.parseStory(currentStory);
		return story;
	}
	private async getStory(
		storyId: bigint,
		currentId: string | undefined = undefined
	) {
		const data = await this.getData(storyId);
		const items = data.reels_media[0].items;
		const user = data.reels_media[0].user;

		this.tacker.data.user = await Helpers.getCurrentInstagramUserId();
		this.tacker.data.owner = user;
		this.tacker.data.payload = data;

		const stories = this.parseStory(items) as I.ShortStory[];
		this.tacker.data.files = stories.map((item: I.ShortStory) => ({
			url: item.isVideo ? item.video! : item.image,
			extension: item.isVideo ? "mp4" : "png",
			id: item.id,
			fileName: `${this.currentUser}_${item.id}_${moment().unix()}`,
			height: item.height,
			width: item.width,
		}));
		if (this.getStoryType === "highlight") {
			Helpers.sendMessage(MessageTypes.INSTA_HIGHLIGH_CACHE, {
				items,
				user,
				highlightId: storyId.toString(),
			});
		}
		this.currentUser = user.username;
		return this.filterStories(items, currentId);
	}

	async getData(storyId: bigint): Promise<I.StoryResponse> {
		let URL;

		switch (this.getStoryType) {
			case "reel":
				URL = `https://www.instagram.com/api/v1/feed/reels_media/?reel_ids=${storyId}`;
				break;
			case "story":
				URL = `https://www.instagram.com/api/v1/feed/reels_media/?reel_ids=${storyId}`;
				break;
			case "highlight":
				URL = `https://www.instagram.com/api/v1/feed/reels_media/?reel_ids=highlight:${storyId}`;
				break;
		}

		const res = await fetch(URL, {
			headers: {
				"x-ig-app-id": "936619743392459",
			},
		});
		const data: I.StoryResponse = await res.json();

		return data;
	}
	parseStory(data: I.Story | I.Story[]): I.ShortStory | I.ShortStory[] {
		if (Array.isArray(data)) {
			const stories: I.ShortStory[] = [];
			for (const item of data) {
				const isVideo = item.media_type === 2;
				stories.push({
					image: item.image_versions2.candidates[0].url,
					isVideo,
					video: item.video_versions ? item.video_versions[0]?.url : undefined,
					id: item.pk,
					timeTaken: item.taken_at,
					width: isVideo
						? item.video_versions[0].width
						: item.image_versions2.candidates[0].width,
					height: item.image_versions2.candidates[0].height,
				});
			}
			return stories;
		} else {
			const isVideo = data.media_type === 2;
			return {
				image: data.image_versions2.candidates[0].url,
				isVideo,
				video: data.video_versions ? data.video_versions[0]?.url : undefined,
				id: data.pk,
				timeTaken: data.taken_at,
				width: data.image_versions2.candidates[0].width,
				height: data.image_versions2.candidates[0].height,
			};
		}
	}
}

export default new Stories();
