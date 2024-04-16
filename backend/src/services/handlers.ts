import {FB, IG, T} from '@/types';

import {Job} from 'bullmq';
import {TrackerService} from '.';

const Handlers = {
	Tracker: async (job: Job<T.TrackerData<IG.Actor | FB.Actor>>) => {
		try {
			const res = await TrackerService.Track(job.data);
			return res;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message);
			}
		}
	}
};

export default Handlers;
