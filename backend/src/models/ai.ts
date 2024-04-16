import {Schema, model} from 'mongoose';

import {AI} from '@/types';

const AISchema = new Schema<AI.IDocument, AI.IModel>(
	{
		faceCount: {
			type: Number,
			required: true,
			default: 0
		},
		gender: {
			type: String,
			required: true,
			enum: Object.values(AI.Gender),
			default: AI.Gender.unknown
		},
		description: {
			type: String,
			required: true
		}
	},
	{
		timestamps: true,
		versionKey: false,
		toJSON: {
			transform: (_, ret) => {
				delete ret._id;
			}
		}
	}
);

const Vision = model<AI.IDocument, AI.IModel>('AI', AISchema);

export default Vision;
