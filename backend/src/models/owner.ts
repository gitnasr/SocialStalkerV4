import {Schema, model} from 'mongoose';

import {O} from '@/types';

const OwnerSchema: Schema = new Schema<O.IDocument, O.IModel>(
	{
		source: {
			type: String,
			required: true
		},
		id: {
			type: String,
			required: true
		},
		username: {
			type: String,
			required: true
		},
		photo: {
			type: Schema.Types.ObjectId,
			required: false,
			ref: 'Photo'
		},
		payload: {
			type: Schema.Types.Mixed,
			required: false
		},
		fullName: {
			type: String,
			default:"N/A"
		},
		userId: {
			type: String,
			required: true
		},
		tracks: {
			type: [Schema.Types.ObjectId],
			required: false
		},
		lastEvent: {
			type: String,
			required: false
		},
		lastActivity: {
			type: Date,
			required: false
		}
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'owners'
	}
);

const Owner = model<O.IDocument, O.IModel>('Owner', OwnerSchema);

export default Owner;
