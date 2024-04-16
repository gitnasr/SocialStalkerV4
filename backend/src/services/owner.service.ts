import {A, O} from '@/types';

import {Owner} from '@/models';
import {Schema} from 'mongoose';
import {nanoid} from 'nanoid';
import {Cloud} from '.';

const findByUserId = (id: string): Promise<O.IDocument | null> => {
	return Owner.findOne({userId: id}).populate({
		path: 'photo',
		model: 'Assets'
	});
};
const create = async (owner: any) => {
	const id = nanoid(12);
	owner.id = id;
	return Owner.create(owner);
};

const update = async (id: Schema.Types.ObjectId, payload: Partial<O.Update>): Promise<O.IDocument | null> => {
	const newOwner = await Owner.findByIdAndUpdate(id, {...payload}, {new: true});
	return newOwner;
};

const findByHash = async (
	id: string,
	pp: string,
	payload: Partial<O.Update>
): Promise<{
	exist: boolean;
	doc: O.IDocument;
	isSimilar: boolean;
}> => {
	const owner = await findByUserId(id);
	if (owner) {
		if (!owner.photo) {
			const updatedOwner = await update(owner._id, payload);
			return {
				exist: true,
				doc: updatedOwner ? updatedOwner : owner,
				isSimilar: false
			};
		}
		const currentPhoto = owner.photo as A.Asset;
		const hash = currentPhoto.hash;
		const pp_hash = await Cloud.HashAssets(pp);
		const {similar} = Cloud.SimilarityChecker(hash, pp_hash);
		if (similar) {
			const updatedOwner = await update(owner._id, payload);

			return {
				exist: true,
				doc: updatedOwner ? updatedOwner : owner,
				isSimilar: true
			};
		}

		return {
			exist: true,
			doc: owner,
			isSimilar: false
		};
	}

	return {
		exist: false,
		doc: await create(payload),
		isSimilar: false
	};
};

export {create, findByHash, findByUserId, update};
