import {AssetService, NotificationService, OwnerService, RedisService} from '.';
import {FileExtension, IG, O} from '@/types';

import axios from 'axios';

const getInfoById = async (id: string): Promise<IG.Actor | undefined> => {
	try {
		const IG = await RedisService.get('IG:Cookie');
		if (!IG) {
			NotificationService.send('Instagram cookie not found', 'error');
			return;
		}  
		const Headers = {
			headers: {
				Cookie: IG,
				'x-ig-app-id': '936619743392459'
			}
		};
		const response = await axios.get(`https://i.instagram.com/api/v1/users/${id}/info/`, Headers);

		return response.data.user as IG.Actor;
	} catch (error) {
		NotificationService.send(`Instagram Fetch Info: ${error}`, 'error');
		return	
	}
};

const newUser = async (user: IG.Actor | string, eventName: string): Promise<{doc: O.IDocument; exist: boolean; isSimilar: boolean}> => {
	let userInfo = user as IG.Actor;
	if (typeof user === 'string') {
		let data = await getInfoById(user);
		if (!data) throw new Error('User not found');
		userInfo = data;
	}
	const pp = userInfo?.hd_profile_pic_url_info?.url || userInfo.profile_pic_url;
	let User = await OwnerService.findByHash(userInfo.pk, pp, {username: userInfo.username, fullName: userInfo.full_name, source: 'INSTAGRAM', userId: userInfo.pk});

	if (User.exist && User.isSimilar) return User;
	if (typeof user !== 'string') {
		const refreshAccountData = await getInfoById(userInfo.pk);
		if (!refreshAccountData) throw new Error('User not found');
		userInfo = refreshAccountData;
	}
	const userPhoto = await AssetService.create({
		extension: FileExtension.png,
		fileName: `${userInfo.username}_profile_picture`,
		originalURL: userInfo.hd_profile_pic_url_info.url,
		source: 'INSTAGRAM',
		owner: User.doc._id,
		eventName,
		isVideo: false,
		user: User.doc._id,
		assetType: 'PROFILE_PICTURE',
		itemId: userInfo.profile_pic_id
	});
	if (!userPhoto) return User;
	const updatedUser = await OwnerService.update(User.doc._id, {photo: userPhoto._id});
	User = {
		doc: updatedUser ? updatedUser : User.doc,
		exist: false,
		isSimilar: false
	};
	return User;
};

export {newUser};
