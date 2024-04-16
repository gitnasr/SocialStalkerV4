import IPinfoWrapper, {IPinfo, LruCache, Options} from 'node-ipinfo';

import {config} from '@/config';

export class IPService {
	private ipinfo: IPinfoWrapper;

	constructor() {
		const cacheOptions: Options<string, any> = {
			max: 5000,
			ttl: 24 * 1000 * 60 * 60,
		};
		const cache = new LruCache(cacheOptions);

		this.ipinfo = new IPinfoWrapper(config.ipinfo.token,cache);
		
	}
	async getIPInfo(ip: string): Promise<IPinfo> {
		return this.ipinfo.lookupIp(ip);
	}
}
export default new IPService();
