import express, {Router} from 'express';

import {Tracker} from '@/controller';
import { TrackerSchema } from '@/middlewares/validation/tracker';
import {TrackerWares} from '@/middlewares';
import {createValidator} from 'express-joi-validation';

const validator = createValidator();

const router: Router = express.Router();

router.post('/', TrackerWares.Decryptor, validator.body(TrackerSchema), Tracker.Track);
router.post('/log', TrackerWares.Decryptor, Tracker.Log);

export default router;
