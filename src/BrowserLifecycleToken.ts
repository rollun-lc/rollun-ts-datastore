import { randomString } from 'rollun-ts-utils';

export interface LifecycleTokenStorage {
	getItem: (name: string) => string | null;
	setItem: (key: string, value: string) => void;
}

export default class BrowserLifecycleToken {
	public static Name = 'lifecycle_token';

	constructor(private storage: LifecycleTokenStorage) {
		this.storage = storage;
	}

	public generateAndSetToken() {
		let lcToken = this.storage.getItem(BrowserLifecycleToken.Name) || '';
		const isTokenValid = typeof lcToken === 'string' && lcToken.length === 30;

		if (!lcToken || !isTokenValid) {
			lcToken = randomString(30, 'QWERTYUIOPASDFGHJKLZXCVBNM0123456789');
			this.storage.setItem(BrowserLifecycleToken.Name, lcToken);
		}

		return lcToken;
	}
}
