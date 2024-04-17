import { NextFunction, Request, Response } from 'express';

import SimpleCrypto from 'simple-crypto-js';
import catchAsync from './errors/catchAsync';
import { config } from '@/config';

export const Decryptor = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const {data} = req.body;
    const Crypto = new SimpleCrypto(config.extension.sync);
    const Decrypted = Crypto.decrypt(data);
    req.body = Decrypted;
    next()
});