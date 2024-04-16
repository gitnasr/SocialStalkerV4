import {TrackerRequest} from './tracker';

interface StoryResponse {
	reels_media: [
		{
			items: Story[];
			user: User;
		}
	];
}
interface User {
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

interface Story {
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
export interface Actor {
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
}

export type R = TrackerRequest<string, Actor, StoryResponse>;
