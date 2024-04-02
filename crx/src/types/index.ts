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
export interface StoryGraphQl {
	__a: string[];
	__aaid: string[];
	__ccg: string[];
	__comet_req: string[];
	__csr: string[];
	__dyn: string[];
	__hs: string[];
	__hsi: string[];
	__req: string[];
	__rev: string[];
	__s: string[];
	__spin_b: string[];
	__spin_r: string[];
	__spin_t: string[];
	__user: string[];
	av: string[];
	doc_id: string[];
	dpr: string[];
	fb_api_caller_class: string[];
	fb_api_req_friendly_name: string[];
	fb_dtsg: string[];
	jazoest: string[];
	lsd: string[];
	server_timestamps: string[];
	variables: string[];
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
	name: string
	short_name: "Amanii";
	__typename: "User";
}
interface VideoAttachment {
    __typename: "Video";
    playable_url_quality_hd: string;
    previewImage: {
        uri: string;
    };
    playable_url: string;
    id: string;

}
interface PhotoAttachment {
    __typename: "Photo";
    image: {
        uri: string;
    };
    id: string;

}

type  Attachment<T> = {
    [P in keyof T]?: T[P];
}

export type StoryAttachment = Attachment<VideoAttachment> | Attachment<PhotoAttachment>;
export interface StoryResult {
	storyId: string;
	bucketId: string;
	storyType: "Photo" | "Video" | undefined;
	createdAt: number;
	storyOwner: StoryOwner;
	attachment: StoryAttachment
	currentUser: string;
    videoAsPhoto?: string;
    videoUrl?: string;
    photoUrl?: string;
    

}


