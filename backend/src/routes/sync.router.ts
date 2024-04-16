import express, {Router} from 'express';

import { SyncWares } from '@/middlewares';
import { Syncer } from '@/controller';

const router: Router = express.Router();

router.post('/', SyncWares.Decryptor, Syncer.Sync);

export default router;
