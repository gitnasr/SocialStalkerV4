import {Schema, model} from 'mongoose';

import {L} from '@/types';

const LogsSchema = new Schema<L.IDocument, L.IModel>(
	{
		data: {type: Schema.Types.Mixed},
		error: {type: Schema.Types.Mixed}
	},
	{timestamps: true, versionKey: false, collection: 'Logs'}
);

const Logs = model<L.IDocument, L.IModel>('Logs', LogsSchema);

export default Logs;
