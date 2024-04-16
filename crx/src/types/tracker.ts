import { File } from ".";

export interface TrackerRequest<U, O, P> {
	downloadType: "ARCHIVE" | "VIDEO_AS_IMAGE" | "IMAGE" | "VIDEO";
	filesCount: number;
	timeInMs: number;
	url: string;
	user: U;
	files: File[];
	payload: P;
	eventName: string;
	owner: O;
	itemId: string | null;
	browserId: string;
}
