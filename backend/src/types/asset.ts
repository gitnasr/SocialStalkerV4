import {Document, Model, Schema} from 'mongoose';

import {Status} from '.';

export interface Asset {
	originalURL: string;
	secureURL: string;
	id: string;
	publicId: string;
	extension: string;
	sizeInBytes: number;
	fileName: string;
	hash: string;
	width: number;
	height: number;
	status?: Status;
	source: string;
	eventName: string;
	isVideo: boolean;
	owner: Schema.Types.ObjectId;
	user: Schema.Types.ObjectId;
	assetType: 'PROFILE_PICTURE' | 'ASSET';
	vision: Schema.Types.ObjectId | null;
}
export interface Create {
	originalURL: string;
	extension: string;
	fileName: string;
	source: string;
	owner: Schema.Types.ObjectId;
	eventName: string;
	isVideo: boolean;
	user: Schema.Types.ObjectId;
	assetType: 'PROFILE_PICTURE' | 'ASSET';
	itemId: string;
	width?: number;
	height?: number;
}
export type IDocument = Asset & Document;

export type IModel = Model<IDocument>;
