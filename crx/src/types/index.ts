
export interface IStorage {
	<T>(key: string): Promise<T | null>;
}
export type ButtonTypes = "zip"  | "image" | "video"
export interface File {
    extension: "png" | "mp4";
    url: string | undefined;
    fileName?: string;
}

import * as Facebook from "./facebook";
import * as Instagram from "./instagram";

export { Facebook, Instagram};