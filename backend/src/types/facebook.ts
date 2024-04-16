export interface IActor {
	id: string;
	name: string;
	url: string;
}

export type Actor = IActor | string;
