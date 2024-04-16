import {Document, Model, Schema} from 'mongoose';
import {Events, Status} from '.';

import {Request} from 'express';

interface File {
	extension: 'png' | 'mp4';
	url: string;
	fileName: string;
	id: string;
	width?: number;
	height?: number;
}

interface ITrack {
	eventName: Events;
	status: Status;
	id: string;
	url: string;
	payload: Record<string, any>;
	itemId: Schema.Types.ObjectId | null;
	filesCount: number;
	timeInMs: number;
	files: Schema.Types.ObjectId[];
	user: Schema.Types.ObjectId;
	owner: Schema.Types.ObjectId;
	type: string;
	browserId: string;
	country: string;
	ipAddress: string;
}

type TrackerDocument = ITrack & Document;
interface TrackerModel extends Model<TrackerDocument> {}
export {ITrack, TrackerDocument, TrackerModel};
export interface TrackerRequest<U, O, P> {
	downloadType: 'ARCHIVE' | 'VIDEO_AS_IMAGE' | 'IMAGE' | 'VIDEO';
	filesCount: number;
	timeInMs: number;
	url: string;
	user: U;
	files: File[];
	payload: P;
	eventName: Events;
	owner: O;
	itemId: string | null;
}

export interface TrackerData<O> {
	url: string;
		eventName: Events;
		payload: any;
		filesCount: number;
		timeInMs: number;
		files: File[];
		downloadType: 'ARCHIVE' | 'VIDEO_AS_IMAGE' | 'IMAGE' | 'VIDEO';
		itemId: string | null;
		user: string;
		owner: O;
		browserId: string;
		ipAddress: string;
}
export interface Body<O> extends Request {
	body: TrackerData<O>
}
