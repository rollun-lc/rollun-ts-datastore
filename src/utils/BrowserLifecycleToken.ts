import { randomString } from 'rollun-ts-utils';

export interface LifecycleTokenStorage {
	getItem: (name: string) => string | null;
	setItem: (key: string, value: string) => void;
}

export interface Options {
	tokenName?: string;
	charset?: string;
	tokenLength?: number;
}

export default class BrowserLifecycleToken {
	private name: string;  
	private charset: string;
	private tokenLength: number;

	constructor(private storage: LifecycleTokenStorage, options: Options = {}) {
		this.storage = storage;
		this.name = options?.tokenName || 'lifecycle_token';
		this.charset = options?.charset || 'QWERTYUIOPASDFGHJKLZXCVBNM0123456789';
		this.tokenLength = options?.tokenLength || 30;
	}

	public generateAndSetToken() {
		let lcToken = this.storage.getItem(this.name) || '';
		const isTokenValid = typeof lcToken === 'string' && lcToken.length === this.tokenLength;

		if (!lcToken || !isTokenValid) {
			lcToken = randomString(this.tokenLength, this.charset);
			this.storage.setItem(this.name, lcToken);
		}

		return lcToken;
	}

	get Name() {
		return this.name;
	}
}
