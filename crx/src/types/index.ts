export interface IStorage {
	<T>(key: string): Promise<T | null>;
}
export type ButtonTypes = "zip" | "image" | "video";
export interface File {
	extension: "png" | "mp4";
	url: string;
	fileName: string;
	id: string;
	width?: number;
	height?: number;
}

import * as Facebook from "./facebook";
import * as Instagram from "./instagram";
import * as T from "./tracker";

export { Facebook, Instagram, T };
