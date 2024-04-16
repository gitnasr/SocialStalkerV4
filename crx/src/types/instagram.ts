import { TrackerRequest } from "./tracker";

export interface StoryCache {
	highlightId: string;
	user: User;
	items: Story[];
}
export interface ShortStory {
	image: string;
	isVideo: boolean;
	video: string | undefined;
	id: string;
	timeTaken: number;
	width: number;
	height: number;
}

export interface User {
	full_name: string;
	is_private: boolean;
	is_verified: boolean;
	pk: string;
	profile_pic_id: string;
	profile_pic_url: string;
	hd_profile_pic_url_info: {
		url: string;
	};
	username: string;
	id: string;
}
export interface SearchResponse {
	data: {
		user: User;
	};
}

interface Owner {
	pk: string;
	is_private: boolean;
}

interface ImageCandidate {
	url: string;
	width: number;
	height: number;
}

interface VideoVersion {
	id: string;
	type: number;
	url: string;
	width: number;
	height: number;
}

export interface Story {
	pk: string;
	id: string;
	code: string;
	owner: Owner;
	taken_at: number;
	image_versions2: {
		candidates: ImageCandidate[];
	};
	video_versions: VideoVersion[];
	video_duration: number;
	has_audio: boolean;
	product_type: string;
	commerciality_status: string;
	media_type: number;
}
export interface LastProfile {
	username: string;
	userId: number;
}
export interface StoryRequestVariables {
	reelId: string;
	reelMediaId: string;
	reelMediaOwnerId: string;
	reelMediaTakenAt: number;
	viewSeenAt: number;
}
export interface StoryGraphQl {
	av: string | string[];
	__d: string | string[];
	__user: number | number[];
	__a: number | number[];
	__req: string | string[];
	__hs: string | string[];
	dpr: number | number[];
	__ccg: string | string[];
	__rev: number | number[];
	__s: string | string[];
	__hsi: string | string[];
	__dyn: string | string[];
	__csr: string | string[];
	__comet_req: number | number[];
	fb_dtsg: string | string[];
	jazoest: number | number[];
	lsd: string | string[];
	__spin_r: number | number[];
	__spin_b: string | string[];
	__spin_t: number | number[];
	fb_api_caller_class: string | string[];
	fb_api_req_friendly_name: string | string[];
	variables: string | StoryRequestVariables;
	server_timestamps: boolean | boolean[];
	doc_id: string | string[];
}
export type StoryTypes = "reel" | "story" | "highlight";

export interface PostResponse {
	items: Post[];
	num_results: number;
	more_available: boolean;
	next_max_id?: string;
}
export interface CarouselMedia {
	id: string;
	image_versions2: {
		candidates: ImageCandidate[];
	};
	video_versions?: VideoVersion[];
	video_duration?: number;
	has_audio?: boolean;
	media_type: MediaTypes;
}
export interface Post {
	taken_at: number;
	pk: string;
	id: string;
	like_count: number;
	comment_count: number;
	media_type: MediaTypes;
	code: string;
	user: User;
	carousel_media_count?: number;
	image_versions2: {
		candidates: ImageCandidate[];
	};
	carousel_media?: CarouselMedia[];
	video_versions?: VideoVersion[];
	video_duration?: number;
	has_audio?: boolean;
}

export enum MediaTypes {
	IMAGE = 1,
	VIDEO = 2,
	CAROUSEL = 8,
}

export interface ViewResponse {
	data: {
		user: User;
	};
}

export type StoryTrackRequest = TrackerRequest<string, User, StoryResponse>;

export type PPTrackRequest = TrackerRequest<string, User, User>;
export type PostsTrackRequest = TrackerRequest<string, User, Post[]>;
export type PostTrackRequest = TrackerRequest<string, User, Post>;
export interface StoryResponse {
	reels_media: [
		{
			items: Story[];
			user: User;
		}
	];
}
