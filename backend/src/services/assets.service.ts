import {A, FileExtension} from '@/types';
import {Cloud, UService} from '.';

import Assets from '@/models/asset';
import {nanoid} from 'nanoid';

const findByHash = async (hash: string): Promise<any> => {
	return Assets.findOne({hash});
};

const create = async (asset: A.Create): Promise<A.IDocument | undefined> => {
	const id = nanoid(12);

	let hash = '';
	if (asset.originalURL) {
		let assetDimensions = {
			width: asset.width || 0,
			height: asset.height || 0
		};

		if (asset.extension === FileExtension.png) {
			hash = await Cloud.HashAssets(asset.originalURL);
			const isExisted = await findByHash(hash);
			if (isExisted) {
				return isExisted;
			}
			if (!assetDimensions.width || !assetDimensions.height) assetDimensions = await UService.getImageDimensions(asset.originalURL);
		} else {
			hash = `${asset.eventName}_${asset.itemId}`;
			const isExisted = await findByHash(hash);
			if (isExisted) {
				return isExisted;
			}
		}
		const assetSize = await UService.getFileSizeByUrl(asset.originalURL);

		const assetOnCloud = await Cloud.UploadAsset(asset.originalURL);
		const payload: A.Asset = Object.assign(asset, {
			id,
			sizeInBytes: assetSize,
			width: assetDimensions.width,
			height: assetDimensions.height,
			hash,
			secureURL: assetOnCloud.secure_url,
			publicId: assetOnCloud.public_id,
			vision: null
		});

		return Assets.create(payload);
	}
};

export {create, findByHash};
