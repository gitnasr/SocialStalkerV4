import {config, logger} from '@/config';

import Redis from 'ioredis';
import { RedisKeys } from '@/types';

class RedisService {
    client: Redis;
    constructor() {
        this.client = new Redis(config.redis.url, {maxRetriesPerRequest: null, });
        this.client.on('connect', () => {
            logger.info('Redis connected');
        });
    }
    async get(key: RedisKeys) {
        return this.client.get(key);
    }

    async set(key: RedisKeys, value: string) {
        return this.client.set(key, value);
    }
    async del(key: RedisKeys) {
        return this.client.del(key);
    }
    async setEx(key: RedisKeys, value: string, time: number) {
        return this.client.setex(key, time, value);
    }
    async setList(key: RedisKeys, value: string) {
        return this.client.lpush(key, value);
    }
    async getListLength(key: RedisKeys) {
        return this.client.llen(key);
    }
}

export default new RedisService;