import {A, Status} from '@/types';
import {Schema, model} from 'mongoose';

const AssetsSchema = new Schema<A.IDocument, A.IModel>(
	{
		originalURL: {
			type: String,
			required: true
		},

		secureURL: {
			type: String,
			required: true
		},
		id: {
			type: String,
			required: true
		},
		publicId: {
			type: String,
			required: true
		},
		extension: {
			type: String,
			required: true,
			default: 'png'
		},
		sizeInBytes: {
			type: Number,
			required: true,
			default: 0
		},
		fileName: {
			type: String,
			required: true
		},
		hash: {
			type: String,
			required: true
		},
		width: {
			type: Number,
			required: true
		},
		height: {
			type: Number,
			required: true
		},
		status: {
			type: String,
			required: true,
			enum: Object.values(Status),
			default: Status.PENDING
		},

		source: {
			type: String,
			required: true
		},

		eventName: {
			type: String,
			required: true
		},
		isVideo: {
			type: Boolean,
			required: true,
			default: false
		},

		owner: {type: Schema.Types.ObjectId, required: true},
		user: {type: Schema.Types.ObjectId, required: true},
		assetType: {
			type: String,
			required: true
		},
		vision: {
			type: Schema.Types.ObjectId,
			required: false
		}
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'assets'
	}
);

const Assets = model<A.IDocument, A.IModel>('Assets', AssetsSchema);

export default Assets;
