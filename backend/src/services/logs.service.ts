import {Logs} from '@/models';
import {NotificationService} from '.';

export const Create = async (payload: any) => {
	await Logs.create(payload);

	return NotificationService.send('MAYDAY: A new log entry has been created.', 'error');
};
