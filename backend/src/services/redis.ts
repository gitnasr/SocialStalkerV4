import {config, logger} from '@/config';

import Redis from 'ioredis';

class RedisService {
    client: Redis;
    constructor() {
        this.client = new Redis(config.redis.url, {maxRetriesPerRequest: null, });
        this.client.on('connect', () => {
            logger.info('Redis connected');
        });
    }
    async get(key: string) {
        return this.client.get(key);
    }

    async set(key: string, value: string) {
        return this.client.set(key, value);
    }
    async del(key: string) {
        return this.client.del(key);
    }
    async setEx(key: string, value: string, time: number) {
        return this.client.setex(key, time, value);
    }
    async setList(key: string, value: string) {
        return this.client.lpush(key, value);
    }
    async getListLength(key: string) {
        return this.client.llen(key);
    }
}

export default new RedisService;