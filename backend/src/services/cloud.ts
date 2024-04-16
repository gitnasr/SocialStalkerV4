import * as ImageHash from 'image-hash';

import {config} from '@/config';
import {v2 as cloudinary} from 'cloudinary';

export const UploadAsset = async (remoteUEL: string) => {
	return cloudinary.uploader.upload(remoteUEL, {
		folder: config.env === 'development' ? 'development' : 'production',

		resource_type: 'auto'
	});
};

const HashImage = async (url: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		ImageHash.imageHash(url, 16, true, (error, data) => {
			if (error) {
				resolve('NULL');
			} else {
				resolve(data);
			}
		});
	});
};
export const HashAssets = async (url: string): Promise<string> => {
	const hash = await HashImage(url);
	return hash;
};

export const SimilarityChecker = (hash1: string, hash2: string) => {
	if (hash1.length !== hash2.length) {
		throw new Error('pHashes must have the same length');
	}

	let hammingDist = 0;
	for (let i = 0; i < hash1.length; i++) {
		if (hash1[i] !== hash2[i]) {
			hammingDist++;
		}
	}
	const totalBits = hash1.length;
	const similarity = (totalBits - hammingDist) / totalBits;

	return {
		similar: similarity >= 0.7,
		percentage: similarity
	};
};
