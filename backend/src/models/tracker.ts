import {Status, T} from '@/types';
import {Schema, model} from 'mongoose';

const TrackSchema: Schema = new Schema<T.TrackerDocument, T.TrackerModel>(
	{
		browserId: {
			type: String,
			required: true
		},
		country: {
			type: String,
			required: true
		},
		ipAddress: {
			type: String,
			required: true
		},
		eventName: {
			type: String,
			required: true
		},
		id: {
			type: String,
			required: true,
			unique: true
		},
		url: {
			type: String,
			required: true
		},
		itemId: {
			type: Schema.Types.ObjectId,
			default: null
		},
		payload: {
			type: Schema.Types.Mixed,
			required: true
		},
		filesCount: {
			type: Number,
			required: true,
			default: 0
		},
		files: {
			type: [Schema.Types.ObjectId],
			required: true
		},

		owner: {
			type: Schema.Types.ObjectId,
			required: true
		},
		timeInMs: {
			type: Number,
			required: true,
			default: 0
		},
		user: {
			type: Schema.Types.ObjectId,
			required: true
		},

		status: {
			type: String,
			required: true,
			enum: Object.values(Status),
			default: Status.PENDING
		},
		type: {
			type: String,
			required: true
		}
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'tracks',
		toJSON: {
			transform: (doc, ret) => {
				delete ret._id;
				return ret;
			}
		}
	}
);

const Track = model<T.TrackerDocument, T.TrackerModel>('Track', TrackSchema);

export default Track;
