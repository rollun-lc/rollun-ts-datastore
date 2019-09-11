import { HttpRequestOptions } from '../interfaces';
import AbstractClient from './AbstractClient';
import fetch, { Headers, Request, Response } from 'node-fetch';

export default class BrowserClient extends AbstractClient {
	constructor(url: string, options: { headers?: {} } = {}) {
		super();
		this.url = url;
		let headers = {
			'Accept': 'application/json',
			'Content-Type': 'application/json'

		};
		if (options.headers) {
			headers = Object.assign({}, headers, options.headers);
		}
		this.headers = new Headers(headers);
	}

	// FIXME: fix slashes when building request url

	get(uri?: string, options: HttpRequestOptions = {}): Promise<Response> {
		const fullRequestUrl = uri ? `${this.url}${uri}` : this.url;
		return fetch(new Request(fullRequestUrl, {
			method: 'GET',
			headers: this.generateFullHeaders(options.headers)
		})).then(this.catchHTTPResponseError);
	}

	post(uri?: {}, body?: {}, options: HttpRequestOptions = {}): Promise<Response> {
		const fullRequestUrl = uri ? `${this.url}${uri}` : this.url;
		return fetch(new Request(fullRequestUrl, {
			method: 'POST',
			headers: this.generateFullHeaders(options.headers),
			body: this.generateRequestBodyString(body)
		})).then(this.catchHTTPResponseError);
	}

	put(uri?: string, body?: {}, options: HttpRequestOptions = {}): Promise<Response> {
		const fullRequestUrl = uri ? `${this.url}${uri}` : this.url;
		return fetch(new Request(fullRequestUrl, {
			method: 'PUT',
			headers: this.generateFullHeaders(options.headers),
			body: this.generateRequestBodyString(body)
		})).then(this.catchHTTPResponseError);
	}

	delete(uri?: string, options: HttpRequestOptions = {}): Promise<Response> {
		const fullRequestUrl = uri ? `${this.url}${uri}` : this.url;
		return fetch(new Request(fullRequestUrl, {
			method: 'DELETE',
			headers: this.generateFullHeaders(options.headers)
		})).then(this.catchHTTPResponseError);
	}

	head(uri?: string, options: HttpRequestOptions = {}): Promise<Response> {
		const requestUrl = uri ? `${this.url}${uri}` : this.url;
		return fetch(new Request(requestUrl, {
			method: 'HEAD',
			headers: this.generateFullHeaders(options.headers)
		})).then(this.catchHTTPResponseError);
	}
}
