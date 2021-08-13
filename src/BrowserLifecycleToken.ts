import { randomString } from 'rollun-ts-utils';

export default class BrowserLifecycleToken {
	public static TokenName = 'lifecycle_token';

	private static generateLCToken() {
		return randomString(30, 'QWERTYUIOPASDFGHJKLZXCVBNM0123456789');
	}

	public static isValidLCToken(token: string | null) {
		return typeof token === 'string' && token.length === 30;
	}

	public static generateAndSetToken() {
		if (!sessionStorage) {
			return null;
		}

		let lcToken = sessionStorage.getItem(BrowserLifecycleToken.TokenName) || '';
		if (!lcToken || BrowserLifecycleToken.isValidLCToken(lcToken)) {
			lcToken = BrowserLifecycleToken.generateLCToken();
			sessionStorage.setItem(BrowserLifecycleToken.TokenName, lcToken);
		}

		return lcToken;
	}
}
