import {FB, FileExtension} from '@/types';
import {AssetService, OwnerService} from '.';

import axios from 'axios';
import {nanoid} from 'nanoid';

const newUser = async (user: FB.Actor, eventName: string) => {
	const actor = typeof user === 'string' ? user : user.id;
	const {url} = await getProfilePicture(actor);
	const {name} = await getName(actor);
	let User = await OwnerService.findByHash(actor, url, {username: actor, userId: actor, fullName: name, source: 'FACEBOOK'});
	if (User.exist && User.isSimilar) return User;

	const userPhoto = await AssetService.create({
		extension: FileExtension.png,
		fileName: `${name}_profile_picture`,
		originalURL: url,
		source: 'FACEBOOK',
		owner: User.doc._id,
		eventName,
		isVideo: false,
		user: User.doc._id,
		assetType: 'PROFILE_PICTURE',
		itemId: nanoid(14)
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
const getProfilePicture = async (userId: string) => {
	try {
		const res = await axios.get(`https://graph.facebook.com/${userId}/picture?width=4072&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
		return {
			url: res.request.res.responseUrl,
			success: true
		};
	} catch (error) {
		return {
			url: 'https://ui-avatars.com/api/background=random&size=200&rounded=true&color=fff&bold=true',
			success: false
		};
	}
};
const getName = async (userId: string) => {
	try {
		const res = await axios.get(
			`https://graph.facebook.com/${userId}?fields=id,name&access_token=EAAEQzlOwmpMBALEbqrAmFrOXirFXZCeTeRh98eDyT78yfVmBqjnOf5Q3kBcDkTjd4ZAyStIWoSnDyudXTWq62ZAZCGMwIsIzAHdtloaK98N42CT1sC69LEOz6yATOJqDsNPLHca5tJQyLZAhDTqRvcHCjRGtfyHafAevsxrcomAlc7rFQVfPJs1gNeaZA5a816IPD7L3e03hzZBGMPfMjawWsdqReFBOw8KXSkWjExawexHVEjzBqw8`
		);
		return {
			name: res.data.name,
			success: true
		};
	} catch (error) {
		return {
			name: '',
			success: false
		};
	}
};
export {newUser};
