import * as Joi from 'joi';

import {DownloadTypes, Events, FileExtension} from '@/types';

export const TrackerSchema = Joi.object({
	eventName: Joi.string()
		.required()
		.valid(...Object.values(Events)),
	url: Joi.string().required().uri(),
	payload: Joi.any().required(),
	filesCount: Joi.number().required(),
	owner: Joi.object().required().optional(),
	timeInMs: Joi.number().required(),
	user: Joi.required(),
	downloadType: Joi.string()
		.required()
		.valid(...Object.values(DownloadTypes)),
	files: Joi.array().items(
		Joi.object({
			url: Joi.string().required().uri(),
			extension: Joi.string()
				.required()
				.valid(...Object.values(FileExtension)),
			id: Joi.string().required(),
			fileName: Joi.string(),
			height : Joi.number().optional(),
			width : Joi.number().optional()
		})
	),
	itemId: Joi.string().required().allow(null),
	browserId: Joi.string().required()
});
