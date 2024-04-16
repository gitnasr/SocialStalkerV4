import {A, FB, FileExtension, IG, Status, T} from '@/types';
import {AssetService, FacebookService, IP, InstagramService, OwnerService, TrackerService} from '.';

import { Schema } from 'mongoose';
import {Tracker} from '@/models';
import { config } from '@/config';
import moment from 'moment';
import { nanoid } from 'nanoid';

export const CreateTracker = async (payload: T.ITrack): Promise<T.TrackerDocument> => {
	const track = await Tracker.create(payload);
	await OwnerService.update(payload.user, {
		lastActivity: moment().toDate(),
		lastEvent: payload.eventName,
		$push: {
			tracks: track._id
		}
	});

	return track;
};


export const Track = async (request:T.TrackerData<IG.Actor | FB.Actor>) => {
	const {url, eventName, payload, filesCount, timeInMs, files, downloadType, itemId, browserId, ipAddress, owner, user} = request

	let userDocId: Schema.Types.ObjectId | undefined;
	let ownerDocId: Schema.Types.ObjectId | undefined;
	let source: string | undefined;
	if (eventName.startsWith('INSTAGRAM')) {
		const userDoc = await InstagramService.newUser(user, eventName);
		const ownerDoc = await InstagramService.newUser(owner as IG.Actor, eventName);
		source = 'INSTAGRAM';
		userDocId = userDoc.doc._id;
		ownerDocId = ownerDoc.doc._id;
	}
	if (eventName.startsWith('FACEBOOK')) {
		const userDoc = await FacebookService.newUser(user, eventName);
		source = 'FACEBOOK';
		const ownerDoc = await FacebookService.newUser(owner as FB.Actor, eventName);
		userDocId = userDoc.doc._id;
		ownerDocId = ownerDoc.doc._id;
	}
	if (typeof userDocId == 'undefined' || typeof ownerDocId == 'undefined' || typeof source == 'undefined') {
		throw new Error('Invalid User or Owner');
	}

	const id = nanoid(12);

	const HashMap = new Map<string, A.IDocument>();
	for (const item of files) {
		const id = item.id;
		const assetDoc = await AssetService.create({
			extension: item.extension,
			fileName: item.fileName,
			originalURL: item.url,
			source,
			owner: ownerDocId,
			eventName,
			isVideo: item.extension === FileExtension.mp4,
			user: userDocId,
			assetType: 'ASSET',
			itemId: id,
			width: item.width,
			height: item.height
		});
		if (!assetDoc) continue;

		HashMap.set(id, assetDoc);
	}

	const track = await TrackerService.CreateTracker({
		id: id.toString(),
		owner: ownerDocId,
		user: userDocId,
		eventName,
		url,
		payload,
		filesCount,
		timeInMs,
		itemId: itemId ? HashMap.get(itemId)?._id : null,
		status: Status.SUCCESS,
		files: Array.from(HashMap.values()).map(item => item._id),
		type: downloadType,
		browserId,
		country: config.env === 'development' ? 'N/A' : (await IP.getIPInfo(ipAddress)).country,
		ipAddress: config.env === 'development' ? '127.0.0.1' : ipAddress
	});

	return track

}