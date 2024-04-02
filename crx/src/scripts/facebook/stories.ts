import {
	StoryAttachment,
	StoryGraphQl,
	StoryPayload,
	StoryResult,
	StoryVariables,
} from "@src/types";

import Connector from "../connector";
import Helpers from "../helper";
import { MessageTypes } from "@src/types/enums";
import _ from "underscore";

class Stories {
	private styles: Record<string, string>;
	private wrapper: string;
	constructor() {
		console.log("Stories");

		chrome.runtime.onMessage.addListener(({ message }) =>
         {
        console.log("message", message)

			if (message.type === MessageTypes.STATE_CHANGE) {
				let observer!: MutationObserver;
				if (message.data.url.includes("stories")) {
					observer = new MutationObserver((mutations) => {
						mutations.forEach(() => {
							if (this.isButtonInjected()) {
								return;
							}
							this.injectDownloadButton();
						});
					});
					observer.observe(document, {
						subtree: true,
						childList: true,
						attributes: true,
					});
				} else {
					if (observer) {
						observer.disconnect();
					}
					this.deattachButton();
				}
			}
		});
		this.wrapper = "social-stalker-fb-story-download";

		this.styles = {
			wrapper:
				"display: flex; justify-content: space-between; align-items: center; position: absolute; bottom: 0px; left: 0px; width: 100%; gap: 5px",
			btn2: "background-image: linear-gradient(to right, rgb(255, 81, 47) 0%, rgb(221, 36, 118) 51%, rgb(255, 81, 47) 100%); margin: 10px; padding: 10px; text-align: center; text-transform: uppercase; background-size: 200%; color: white; border-radius: 10px; font-weight: bold; flex: 1; cursor: pointer;",
			btn1: "background-image: linear-gradient(to right, rgb(170, 7, 107) 0%, rgb(97, 4, 95) 51%, rgb(170, 7, 107) 100%); margin: 10px; padding: 10px; text-align: center; text-transform: uppercase; background-size: 200%; color: white; border-radius: 10px; font-weight: bold; flex: 1; cursor: pointer;",
		};
	}
	private isButtonInjected() {
		return !!document.querySelector(this.wrapper);
	}
	private deattachButton() {
		const button = document.querySelector(this.wrapper);
		if (button) {
			button.remove();
		}
	}
	injectDownloadButton() {
		const divsWithDataId = document.querySelectorAll("div[data-id]");

		if (divsWithDataId.length === 0) return;

		if (divsWithDataId.length > 0) {
			for (const div of divsWithDataId) {
				if (div.getAttribute("data-id")?.startsWith("U")) {
					const wrapper = document.createElement(this.wrapper);
					wrapper.style.cssText = this.styles.wrapper;

					const button = document.createElement("button");
					button.style.cssText = this.styles.btn1;
					button.innerText = "Download Story";
					button.addEventListener("click", () => this.download(false));
					wrapper.appendChild(button);
					if (div.querySelector("video")) {
						const asImage = document.createElement("button");
						asImage.style.cssText = this.styles.btn2;
						asImage.innerText = "Download as Image";
						asImage.addEventListener("click", () => this.download(true));
						wrapper.appendChild(asImage);
					}
					div.appendChild(wrapper);
					break;
				}
			}
		}
	}
	async download(asImage: boolean) {
		const lastStory = (await Helpers.getFromStorage(
			"STORY_SEEN"
		)) as StoryGraphQl;

		const storyVariables: StoryVariables = JSON.parse(lastStory.variables[0]);
		const bucketId = storyVariables.input.bucket_id;
		const storyId = storyVariables.input.story_id;
		const currentUser = storyVariables.input.actor_id;

		const fbToken = lastStory.fb_dtsg[0];
		const doc_id = "2913003758722672";

		const Payload: StoryPayload = {
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
			const storyResponse = response.json;
			const { data } = storyResponse;
			const stories = data.nodes[0].unified_stories.edges;

			const requestedStory = _.find(stories, (story) => {
				return story.node.id === storyId;
			});
			if (!requestedStory) {
				return;
			}

			const story = requestedStory.node;
			const createdAt = story?.creation_time;

			const attachment: StoryAttachment = story.attachments[0].media;
			const storyOwner = _.omit(data.nodes[0].owner, [
				"__typename",
				"shortname",
			]);

			const storyType = attachment.__typename;
			const StoryData: StoryResult = {
				storyId,
				bucketId,
				storyType,
				createdAt,
				storyOwner,
				attachment,
				currentUser,
			};
			if (storyType === "Video") {
				const videoUrl = attachment.playable_url_quality_hd;
				const videoAsPhoto = attachment.previewImage?.uri;

				Object.assign(StoryData, { videoUrl, videoAsPhoto });
			}

			if (storyType === "Photo") {
				const photoUrl = attachment.image?.uri;
				Object.assign(StoryData, { photoUrl });
			}

			console.log("StoryData", StoryData);
			if (StoryData.storyType === "Photo" && !asImage) {
				if (StoryData.photoUrl) {
					Helpers.download(
						StoryData.photoUrl,
						StoryData.storyOwner.name,
						"png"
					);
				}
			}

			if (StoryData.storyType === "Video" && !asImage) {
				if (StoryData.videoUrl) {
					Helpers.download(
						StoryData.videoUrl,
						StoryData.storyOwner.name,
						"mp4"
					);
				}
			}

			if (asImage && StoryData.videoAsPhoto) {
				Helpers.download(
					StoryData.videoAsPhoto,
					StoryData.storyOwner.name,
					"png"
				);
			}
		}
	}
}

export default new Stories();
