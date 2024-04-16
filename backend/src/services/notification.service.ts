import axios from 'axios';

class Notification {
	private endpoint: string;
    private config: Record<string, any>;
	constructor() {
		this.endpoint = 'https://ntfy.sh/c0nasr';
		this.config = {
			method: 'post',
			maxBodyLength: Infinity,
			url: this.endpoint,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		};
	}

	send(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
		const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
		const newMessage = `${prefix} | SocialStalker: ${message}`;
        this.config.data = newMessage;
		axios(this.config);
	}
}

export default new Notification();
