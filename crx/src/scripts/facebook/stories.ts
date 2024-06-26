import { ButtonTypes, Facebook as F, File } from "@src/types";

import Connector from "../connector";
import DEditor from "../dom";
import DownloadIcon from "@assets/icons/download.svg";
import DownloadVideo from "@assets/icons/download_video.svg";
import Helpers from "../utils";
import { MessageTypes } from "@src/types/enums";
import Tracker from "../tracker";
import ZipIcon from "@assets/icons/zip.svg";
import _ from "underscore";
import moment from "moment";

class Stories {
	private wrapper: string;
	private observer: MutationObserver | undefined;
	private _StoryTracker = new Tracker<F.StoryTracker>();
	public get StoryTracker() {
		return this._StoryTracker;
	}
	public set StoryTracker(value) {
		this._StoryTracker = value;
	}
	private _currentStoryId = "U";
	private _owner = "unknown";
	public get owner() {
		return this._owner;
	}
	public set owner(value) {
		this._owner = value;
	}
	private userId = 0;
	constructor() {
		this.wrapper = "social-stalker-fb-story-download";

		console.log("Stories Facebook");
		this.watch();
		chrome.runtime.onMessage.addListener((message) => {
			if (message.type === MessageTypes.STATE_CHANGE) {
				if (message.data.url.includes("stories")) {
					this.watch();
				} else {
					DEditor.detachButton(this.wrapper);
				}
			}
		});
	}
	set setCurrentStoryId(id: string) {
		this._currentStoryId = id;
	}
	get currentStoryId() {
		return this._currentStoryId;
	}

	private watch() {
		const currentURL = window.location.href;

		if (!this.observer) {
			this.observer = new MutationObserver((mutationsList) => {
				for (const mutation of mutationsList) {
					if (!DEditor.isInjected(this.wrapper)) {
						return this.injectDownloadButton();
					}
					// Facebook doesn't trigger CHANGE event on stories page so we need to check for new stories manually
					if (mutation.type === "childList") {
						mutation.addedNodes.forEach((node) => {
							const element = node as HTMLElement;
							const storyId = this.findDataId(element);
							if (storyId && storyId != this.currentStoryId) {
								this.setCurrentStoryId = storyId;
								DEditor.detachButton(this.wrapper);
								this.injectDownloadButton();
							}
						});
					}
				}
			});

			this.observer.observe(document.body, {
				subtree: true,
				childList: true,
				attributes: false,
			});
		}
		if (!currentURL.includes("stories") && this.observer) {
			this.observer.disconnect();
			this.observer = undefined;
		}
	}

	private findDataId(div: HTMLElement) {
		return div.getAttribute("data-id");
	}

	injectDownloadButton() {
		const dataId = document.querySelectorAll("div[data-id]");

		if (dataId.length === 0) return;

		if (dataId.length > 0) {
			for (const div of dataId) {
				const dataId = div.getAttribute("data-id");
				if (dataId?.startsWith("U")) {
					this.setCurrentStoryId = dataId;
					const wrapper = DEditor.createWrapperElement(this.wrapper, "wrapper");
					const imageButton = DEditor.createDownloadButton(
						"download-as-image",
						DownloadIcon,
						"image",
						this.download.bind(this)
					);
					wrapper.appendChild(imageButton);
					const isHasVideo = div.querySelector("video");
					if (isHasVideo) {
						const videoButton = DEditor.createDownloadButton(
							"download-as-video",
							DownloadVideo,
							"video",
							this.download.bind(this)
						);
						wrapper.appendChild(videoButton);
					}
					const storyCount = this.getStoryCount();
					if (storyCount > 1) {
						const downloadAllButton = DEditor.createDownloadButton(
							"download-all",
							ZipIcon,
							"zip",
							this.download.bind(this)
						);
						wrapper.appendChild(downloadAllButton);
					}

					const parent = DEditor.findParentForAppending(
						1,
						'div[aria-label="Pause"]'
					);
					if (!parent) throw new Error("Parent not found");
					parent.appendChild(wrapper);
					break;
				}
			}
		}
	}
	private getStoryCount() {
		const quires = {
			q1: document.getElementsByClassName(
				"x78zum5 xqu0tyb x14vqqas xq8finb xod5an3 x16n37ib x10l6tqk x13vifvy x8pckko"
			),
		};
		return quires.q1.length > 0 ? quires.q1[0].children.length : 1;
	}

	async download(type: ButtonTypes) {
		const startedAt = moment();

		try {
			const lastStory = await Helpers.getFromStorage<F.StoryRequest>(
				"STORY_SEEN"
			);
			if (!lastStory) {
				throw new Error("Refresh the page and try again.");
			}

			const storyVariables: F.StoryVariables = JSON.parse(
				lastStory.variables[0]
			);
			const bucketId = storyVariables.input.bucket_id;
			const storyId = storyVariables.input.story_id;
			const currentUser = storyVariables.input.actor_id;

			const fbToken = lastStory.fb_dtsg[0];
			const doc_id = "2913003758722672";

			const Payload: F.StoryPayload = {
				fb_dtsg: fbToken,
				doc_id: doc_id,
				variables: JSON.stringify({
					bucketIDs: [bucketId],
					story_id: storyId,
					scale: 1,
					prefetchPhotoUri: false,
				}),
				server_timestamps: true,
			};
			const connector = new Connector();

			const url = `https://www.facebook.com/api/graphql/`;
			const response = await connector.post(
				url,
				Payload,
				"application/x-www-form-urlencoded",
				true
			);
			if (response.status === 200) {
				const storyResponse = response.json as F.StoryResponse;
				const { data } = storyResponse;
				const StoryBucket = data.nodes[0].unified_stories.edges;
				const ParsedStories: F.ParsedStory[] = [];
				for (const story of StoryBucket) {
					const parsed_story: F.ParsedStory = this.parseStory(story, bucketId);

					ParsedStories.push(parsed_story);
				}
				const owner = data.nodes[0].story_bucket_owner;
				const eventName =
					data.nodes[0].story_bucket_type === "HIGHLIGHTED_STORY"
						? "FACEBOOK_HIGHLIGHTS_DOWNLOAD"
						: "FACEBOOK_STORY_DOWNLOAD";
				this.owner = owner.name;
				this.userId = +owner.id;
				const StoriesLinks: File[] = ParsedStories.map((story) => {
					const isImage = story.attachment.__typename === "Photo";
					return {
						url: isImage ? story.photoUrl : story.videoUrl,
						extension: isImage ? "png" : "mp4",
						id: story.attachment.id,
						fileName: `${this.owner}_story_${story.attachment.id}`,
						height:
							story.attachment.__typename === "Photo"
								? story.attachment.image.height
								: story.attachment.original_height,
						width:
							story.attachment.__typename === "Photo"
								? story.attachment.image.width
								: story.attachment.original_width,
					};
				});
				this.StoryTracker.data = {
					...this.StoryTracker.data,
					owner: owner,
					user: currentUser,
					filesCount: StoriesLinks.length,
					payload: storyResponse,
					url: window.location.href,
					files: StoriesLinks,
					itemId: storyId,
					eventName,
				};
				this.StoryTracker.data.owner = owner;
				if (type !== "zip") {
					const story = _.find(ParsedStories, (story) => story.id === storyId);
					if (!story) {
						throw new Error("Story not found");
					}
					return this.prepareDownload([story], type);
				}

				const zipURL = await Helpers.generateZip(StoriesLinks, this.userId);

				const fileName = `${this.owner}_stories_${moment().unix()}`;
				Helpers.download(zipURL, fileName, "zip");

				this.StoryTracker.data.downloadType = "ARCHIVE";
				this.StoryTracker.data.itemId = null;
			}
		} catch (error) {
			if (error instanceof Error) {
				Helpers.sendMessage(MessageTypes.NOTIFICATION, {
					type: "error",
					content: error.message,
				});
				this.StoryTracker.error = {
					error,
					message: error.message,
				};
			}
		} finally {
			const endedAt = moment();
			const duration = moment
				.duration(endedAt.diff(startedAt))
				.asMilliseconds();
			this.StoryTracker.data.timeInMs = duration;
			this.StoryTracker.send();
		}
	}
	private async prepareDownload(Stories: F.ParsedStory[], type: ButtonTypes) {
		if (Stories.length === 1) {
			const story = Stories[0];
			this.StoryTracker.data.itemId = story.attachment.id;

			const StoryName = `${this.owner}_story_${story.attachment.id}`;
			if (story.storyType === "Photo" && type === "image") {
				if (story.photoUrl) {
					this.StoryTracker.data.downloadType = "IMAGE";
					return Helpers.openTab(story.photoUrl);
				}
			}
			if (story.storyType === "Video" && type === "video" && story.videoUrl) {
				this.StoryTracker.data.downloadType = "VIDEO";
				return Helpers.download(story.videoUrl, StoryName, "mp4");
			}
			if (
				type === "image" &&
				story.storyType === "Video" &&
				story.videoAsPhoto
			) {
				this.StoryTracker.data.downloadType = "VIDEO_AS_IMAGE";
				return Helpers.openTab(story.videoAsPhoto);
			}
		} else {
			this.StoryTracker.data.downloadType = "ARCHIVE";
			this.StoryTracker.data.itemId = null;
		}
	}
	private parseStory(
		StoryBucket: F.SingleBucket,
		bucketId: string
	): F.ParsedStory {
		const story = StoryBucket.node;
		const createdAt = story?.creation_time;

		const attachment: F.StoryAttachment = story.attachments[0].media;

		const storyType = attachment.__typename;
		const StoryData: F.ParsedStory = {
			storyType,
			createdAt,
			attachment,
			bucketId,
			id: story.id,
			videoUrl: "",
			photoUrl: "",
		};
		if (storyType === "Video") {
			const videoUrl =
				attachment.playable_url_quality_hd || attachment.playable_url;
			const videoAsPhoto = attachment.previewImage?.uri;

			Object.assign(StoryData, { videoUrl, videoAsPhoto });
		}

		if (storyType === "Photo") {
			const photoUrl = attachment.image?.uri;
			Object.assign(StoryData, { photoUrl });
		}
		return StoryData;
	}
}

export default new Stories();
