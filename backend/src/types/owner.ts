import {Document, Model, Schema} from 'mongoose';

import {A} from '.';

interface IOwner {
	source: string;
	id: string;
	username: string;
	photo: Schema.Types.ObjectId | A.Asset;
	payload: Schema.Types.Mixed;
	fullName: string;
	userId: string;
	tracks: Schema.Types.ObjectId[];
	lastEvent: string;
	lastActivity: Date;
}
type IDocument = IOwner & Document;
type IModel = Model<IDocument>;
type Update = Omit<Partial<IOwner>, 'tracks'> & {
	$push?: {
		[key: string]: Schema.Types.ObjectId;
	};
};

export {IDocument, IModel, IOwner, Update};
