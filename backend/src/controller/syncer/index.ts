import {Request, Response} from 'express';

import {RedisKeys} from '@/types';
import {RedisService} from '@/services';
import {catchAsync} from '@/middlewares';

export const Sync = catchAsync(async (req: Request, res: Response) => {
	const {instagramCookies} = req.body;

	await RedisService.set(RedisKeys['IG:Cookies'], instagramCookies);
	res.status(200).json({message: 'Cookies saved'});
});
