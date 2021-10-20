import { HttpRequestOptions } from '../datastores/interfaces';
import AbstractClient         from './AbstractClient';
import BrowserLifecycleToken  from '../utils/BrowserLifecycleToken';

export default class BrowserClient<T> extends AbstractClient<T> {
	private readonly timeout: number;

	constructor(url: string, {
		headers = {}, timeout = 0
	} = {}) {
		super();
		const token = new BrowserLifecycleToken(sessionStorage);
		this.url = url;
		this.timeout = timeout || 0;
		this.headers = new Headers({
			[BrowserLifecycleToken.Name]: token.generateAndSetToken(),
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			...headers
		});
	}

	private timeouter(promise: Promise<any>): Promise<any> {
		if (this.timeout <= 0) { return promise; }
		return new Promise((resolve, reject) => {
			const id = setTimeout(() => reject(new Error(`timeout after ${this.timeout}ms`)), this.timeout);
			promise
				.then(result => {
					clearTimeout(id);
					return resolve(result);
				})
				.catch(result => {
					clearTimeout(id);
					return reject(result);
				});
		});
	}

	// FIXME: fix slashes when building request url

	get(uri?: string, options: HttpRequestOptions = {}): Promise<Response> {
		const fullRequestUrl = uri ? `${this.url}${uri}` : this.url;
		return this.timeouter(fetch(new Request(fullRequestUrl, {
			method: 'GET',
			headers: this.generateFullHeaders(options.headers)
		})).then(this.catchHTTPResponseError));
	}

	post(uri?: {}, body?: T, options: HttpRequestOptions = {}): Promise<Response> {
		const fullRequestUrl = uri ? `${this.url}${uri}` : this.url;
		return this.timeouter(fetch(new Request(fullRequestUrl, {
			method: 'POST',
			headers: this.generateFullHeaders(options.headers),
			body: this.generateRequestBodyString(body)
		})).then(this.catchHTTPResponseError));
	}

	put(uri?: string, body?: T, options: HttpRequestOptions = {}): Promise<Response> {
		const fullRequestUrl = uri ? `${this.url}${uri}` : this.url;
		return this.timeouter(fetch(new Request(fullRequestUrl, {
			method: 'PUT',
			headers: this.generateFullHeaders(options.headers),
			body: this.generateRequestBodyString(body)
		})).then(this.catchHTTPResponseError));
	}

	delete(uri?: string, options: HttpRequestOptions = {}): Promise<Response> {
		const fullRequestUrl = uri ? `${this.url}${uri}` : this.url;
		return this.timeouter(fetch(new Request(fullRequestUrl, {
			method: 'DELETE',
			headers: this.generateFullHeaders(options.headers)
		})).then(this.catchHTTPResponseError));
	}

	head(uri?: string, options: HttpRequestOptions = {}): Promise<Response> {
		const requestUrl = uri ? `${this.url}${uri}` : this.url;
		return this.timeouter(fetch(new Request(requestUrl, {
			method: 'HEAD',
			headers: this.generateFullHeaders(options.headers)
		})).then(this.catchHTTPResponseError));
	}
}
