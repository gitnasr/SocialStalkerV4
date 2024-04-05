export interface Flat {
    <T>(formData: Record<string, string[]>): Record<keyof T, string>;
}

export interface IStorage {
	<T>(key: string): Promise<T | null>;
}
export type ButtonTypes = "zip"  | "image" | "video"

import * as Facebook from "./facebook";
import * as Instagram from "./instagram";

export { Facebook, Instagram };