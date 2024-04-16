import {Queue, Worker, WorkerOptions} from 'bullmq';

import {CronTime} from 'cron-time-generator';
import JobHandlers from './handlers';
import { RedisService } from '.';
import moment from 'moment';

class JobService {
	workers: { [key: string]: Worker } | undefined; // Ensures workers is an object with string keys or undefined

	defaultOptions: WorkerOptions;
	Queues: Record<string, Queue> = {}; // Uses keyof with 'this.workers' for type safety
	constructor() {
		this.defaultOptions = {
			connection: RedisService.client,
			removeOnComplete: {
				count: 2,
				age: moment.duration(1, "hour").asSeconds()
			},
			concurrency: 1
		};
		this.defineWorkers();
		this.defineQueue();
	}
	private defineWorkers() {
		this.workers = {
			Tracker: new Worker('Tracker', JobHandlers.Tracker, {
				...this.defaultOptions,
				concurrency: 5,
				removeOnComplete: {
					count: 5
				}
			}),
		
		};
	}
	defineQueue() {
		for (const key in this.workers) {
			this.Queues[key] = new Queue(key, {connection: RedisService.client});
		}
	}
}

export default new JobService();
