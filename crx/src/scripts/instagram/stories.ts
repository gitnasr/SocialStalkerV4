import { ButtonTypes, Instagram as I } from "@src/types";

import DEditor from "../dom";
import DownloadIcon from "@assets/icons/download.svg";
import DownloadVideo from "@assets/icons/download_video.svg";
import Helpers from "../helper";
import { MessageTypes } from "@src/types/enums";
import ZipIcon from "@assets/icons/zip.svg";

class Stories {
	private wrapper: string;
	private observer: MutationObserver | undefined;
	private StoryTypes: I.StoryTypes = "reel";
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

		// Handle first render of the page, if user is already on stories page
		if (currentURL.includes("stories")) {
			this.injectDiv();
		}

		chrome.runtime.onMessage.addListener(({ message }) => {
			if (message.type === MessageTypes.STATE_CHANGE) {
				if (message.data.url.includes("stories")) {
					this.injectDiv();
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

	private injectDiv() {
		if (!this.observer) {
			this.observer = new MutationObserver((mutations) => {
				for (const _ of mutations) {
					if (!DEditor.isInjected(this.wrapper)) {
						this.prepareDownloadButton();

						break;
					}
				}
			});

			this.observer.observe(document, {
				subtree: true,
				childList: true,
			});
		}
	}
	private async download(type: ButtonTypes) {
		
		const lastRequestStoryData = await Helpers.getFromStorage<I.StoryGraphQl>(
			MessageTypes.INSTAGRAM_STORY_SEEN
		);

		if (!lastRequestStoryData) return;
		const vars = JSON.parse(
			lastRequestStoryData.variables as string
		) as I.StoryRequestVariables;
		const reelId = vars.reelId;
		const currentId = vars.reelMediaId;
		const owner = vars.reelMediaOwnerId;
		const cached = await Helpers.getFromStorage<I.StoryCache>(
			MessageTypes.INSTA_STORY_CACHE
		);
		let story: I.ShortStory | I.ShortStory[] = [];
		let storyId = BigInt(owner);
		this.setStoryType = "story";
		if (reelId.includes("highlight")) {
			storyId = BigInt(reelId.split(":")[1]);
			this.setStoryType = "highlight";
		}
		if (type === "zip") {
			story = await this.getStory(storyId);
			const links = Array.isArray(story)
				? story.map((item) => (item.isVideo ? item.video! : item.image))
				: [story.image];
			const zipStream = await Helpers.generateZip(links, parseInt(owner));
			const url = await Helpers.saveBlob(zipStream);
			return Helpers.openTab(url);
		}
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
			if (type === "image") {
				Helpers.openTab(story.image);
			} else {
				if (!story.isVideo) {
					return;
				}
				Helpers.download(story.video!, currentId, "mp4");
			}
		}
	}
	private filterStories(
		items: I.Story[],
		currentId: string | undefined
	): I.ShortStory | I.ShortStory[] {
		if (!currentId) {
			// return all stories
			const stories = items.map((item: I.Story) => this.parseStory(item));
			return stories;
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
		Helpers.sendMessage(MessageTypes.INSTA_STORY_CACHE, {
			items,
			user,
			highlightId: storyId.toString(),
		});
		return this.filterStories(items, currentId);
	}

	async getData(storyId: bigint) {
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
		const data = await res.json();

		//TODO: Send whole data to Backend
		return data;
	}
	parseStory(data: I.Story): I.ShortStory {
		const isVideo = data.media_type === 2;
		return {
			image: data.image_versions2.candidates[0].url,
			isVideo,
			video: data.video_versions ? data.video_versions[0]?.url : null,
			id: data.pk,
			timeTaken: data.taken_at,
		};
	}
}

export default new Stories();
