import { FB, IG, T } from '@/types';
import { Request, Response } from 'express';

import { LogsService } from '@/services';
import { catchAsync } from '@/middlewares';
import emit from '@/services/emitter';
import { nanoid } from 'nanoid';

export const Track = catchAsync(async (req: T.Body<IG.Actor | FB.Actor>, res: Response) => {
	const jName = `Tracker:${nanoid(12)}`
	emit.tracker({...req.body, ipAddress:req.clientIp}, jName);
	return res.sendStatus(200);
});

export const Log = catchAsync(async (req: Request, res: Response) => {
	const {data, error} = req.body;
	return LogsService.Create({data, error})
});
