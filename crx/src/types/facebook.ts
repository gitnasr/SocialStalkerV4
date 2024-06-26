import { File } from ".";
import { TrackerRequest } from "./tracker";

export type StoryVariables = {
	input: {
		bucket_id: string;
		story_id: string;
		actor_id: string;
		client_mutation_id: string;
	};
	scale: number;
};

// This section defines the complete types for the data
export interface StoryRequest {
	__a: string | string[];
	__aaid: string | string[];
	__ccg: string | string[];
	__comet_req: string | string[];
	__csr: string | string[];
	__dyn: string | string[];
	__hs: string | string[];
	__hsi: string | string[];
	__req: string | string[];
	__rev: string | string[];
	__s: string | string[];
	__spin_b: string | string[];
	__spin_r: string | string[];
	__spin_t: string | string[];
	__user: string | string[];
	av: string | string[];
	doc_id: string | string[];
	dpr: string | string[];
	fb_api_caller_class: string | string[];
	fb_api_req_friendly_name: string | string[];
	fb_dtsg: string | string[];
	jazoest: string | string[];
	lsd: string | string[];
	server_timestamps: string | string[];
	variables: string | string[];
}
export interface StoryPayload {
	fb_dtsg: string;
	doc_id: string;
	variables: string;
	server_timestamps: boolean;
}
export interface StoryOwner {
	id: string;
	is_viewer_friend: boolean;
	name: string;
	profile_picture: {
		uri: string;
	};
	url: string;
}
interface VideoAttachment {
	playable_url_quality_hd: string;
	previewImage: {
		uri: string;
	};
	playable_url: string;
	id: string;
	original_height: number;
	original_width: number;
}
interface PhotoAttachment {
	image: {
		uri: string;
		width: number;
		height: number;
	};
	id: string;
}

export type StoryAttachment =
	| (VideoAttachment & { __typename: "Video" })
	| (PhotoAttachment & { __typename: "Photo" });

export interface ParsedStory {
	bucketId: string;
	storyType: "Photo" | "Video";
	createdAt: number;
	attachment: StoryAttachment;
	videoAsPhoto?: string;
	videoUrl: string;
	photoUrl: string;
	id: string;
}

export interface StoryNode {
	id: string;
	story_card_info: {
		viewerList_viewers: {
			edges: {
				node: {
					id: string;
					name: string;
				};
				seen_time: number;
				cursor: string;
			}[];
			page_info: {
				end_cursor: string;
				has_next_page: boolean;
			};
		};
		feedback_summary: {
			reaction_summary: { reaction_unicode: string }[];
			total_reaction_count: number;
		};
		can_viewer_text_reply: boolean;
		story_viewers: { count: number };
		bucket: { camera_post_type: string; id: string };
		original_bucket_owner: {
			__typename: string;
			short_name: string;
			id: string;
		};
		background_color_info: {
			color_info: { dominant_color: string }[];
			id: string;
		};
		story_card_type: string;
	};
	story_card_seen_state: {
		totalSeenCount: { count: number };
		is_seen_by_viewer: boolean;
	};
	story_overlays: { __typename: string }[];
	creation_time: number;
	can_viewer_reshare_to_story: boolean;
	is_eligible_for_mention_story_reshare: boolean;
	attachments: {
		media: StoryAttachment;
	}[];
}

export interface StoryResponse {
	data: {
		nodes: [
			{
				id: string;
				story_bucket_type: "HIGHLIGHTED_STORY" | "STORY";
				unified_stories: {
					edges: [
						{
							node: StoryNode;
						}
					];
				};
				story_bucket_owner: StoryOwner;
			}
		];
	};
}
export type Bucket =
	| { node: StoryNode }
	| [
			{
				node: StoryNode;
			}
	  ]
	| undefined;

export type SingleBucket = {
	node: StoryNode;
};
interface InfoResponse {
	name: string;
	username: string;
	userId: number;
}
export interface ProfileOwner {
	id: string;
	name: string;
}
export type Info = Promise<InfoResponse | undefined>;
export type StoryTracker = TrackerRequest<string, StoryOwner, StoryResponse>;
export type ProfileTracker = TrackerRequest<string, ProfileOwner, File[]>;
