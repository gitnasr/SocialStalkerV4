export interface StoryCache {
	highlightId: string;
	user: User;
	items: Story[];
}
export interface ShortStory {
	image: string;
	isVideo: boolean;
	video: string | null;
	id: string;
	timeTaken: number;
}

interface User {
	full_name: string;
	interop_messaging_user_fbid: number;
	is_private: boolean;
	is_verified: boolean;
	pk: string;
	pk_id: string;
	profile_pic_id: string;
	profile_pic_url: string;
	strong_id__: string;
	username: string;
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

interface MusicAssetInfo {
	title: string;
	display_artist: string;
	cover_artwork_uri: string;
}

interface StoryMusicSticker {
	display_type: string;
	music_asset_info: MusicAssetInfo;
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
	video_versions: VideoVersion[] | undefined;
	video_duration: number;
	has_audio: boolean;
	story_music_stickers?: StoryMusicSticker[];
	product_type: string;
	commerciality_status: string;
	media_type: number;
}
export interface LastProfile {
	username: string | undefined;
	userId: number | undefined;
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
export type StoryTypes = "reel" | "story" | "highlight"