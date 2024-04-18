import Helpers from "./utils";
import SimpleCrypto from "simple-crypto-js";
import { TrackerRequest } from "@src/types/tracker";

interface IError {
	error: Error;
	message: string;
}
type RError = IError | undefined;
class Tracker<T extends TrackerRequest<unknown, unknown, unknown>> {
	private _data: T;
	private _error: RError;
	private _encryptPayload: string | undefined;
	public get encryptPayload(): string | undefined {
		return this._encryptPayload;
	}
	public set encryptPayload(value: string) {
		this._encryptPayload = value;
	}
	public get error(): RError {
		return this._error;
	}
	public set error(value: RError) {
		this._error = value;
	}
	constructor() {
		this._data = {} as T;
	}
	public async send() {
		const getToken = await Helpers.getFromStorage<string>("token");
		if (!getToken) return;
		this.data.browserId = getToken;
		this.Secure();
		if (this.error) {
			await Helpers.post("track/log", {
				error: this.error,
				data: this.encryptPayload,
			});
			this.error = undefined;
			return;
		}
		await Helpers.post("track", { data: this.encryptPayload });
	}

	set data(value: T) {
		this._data = value;
	}
	get data(): T {
		return this._data as T;
	}

	private Secure() {
		// Encrypt the payload
		const secretKey = import.meta.env.VITE_PAYLOAD_SECRET;
		const simpleCrypto = new SimpleCrypto(secretKey);
		const encryptedPayload = simpleCrypto.encrypt(this.data);
		this.encryptPayload = encryptedPayload;
	}
}

export default Tracker;
