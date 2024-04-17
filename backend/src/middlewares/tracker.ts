import {NextFunction, Request, Response} from 'express';

import SimpleCrypto from 'simple-crypto-js';
import catchAsync from './errors/catchAsync';
import {config} from '@/config';

const Decryptor = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
	const {data} = req.body;

	const Crypto = new SimpleCrypto(config.extension.secret);
	const Decrypted = Crypto.decrypt(data);
	if (!Decrypted) return next('Invalid Data');

	// Check if req.body is has error property, if it does, then it's an error object
	if (req.body.hasOwnProperty('error')) {
		req.body.data = Decrypted;
		return next();
	}

	req.body = Decrypted;
	next();
});
export {Decryptor};
