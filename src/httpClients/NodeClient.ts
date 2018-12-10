import {HttpClientInterface, HttpRequestOptions} from "../interfaces";
import fetch from 'node-fetch';
import AbstractClient from "./AbstractClient";

export default class NodeClient extends AbstractClient {
    constructor(url: string, options?: { headers?: {} }) {
        super();
        this.url = url;
        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',

        };
        if (options.headers) {
            headers = {...headers, ...options.headers}
        }
        this.headers = new Headers(headers);
    }

    get(uri?: string, options?: HttpRequestOptions): Promise<Response> {
        const fullRequestUrl = uri ? `${this.url}/${uri}` : this.url;
        return fetch(new Request(fullRequestUrl, {
            method: 'GET',
            headers: this.generateFullHeaders(options.headers),
        }));
    }

    post(uri?: {}, body?: {}, options?: HttpRequestOptions): Promise<Response> {
        const fullRequestUrl = uri ? `${this.url}/${uri}` : this.url;
        return fetch(new Request(fullRequestUrl, {
            method: 'POST',
            headers: this.generateFullHeaders(options.headers),
            body: this.generateRequestBodyString(body),
        }));
    }

    put(uri?: string, body?: {}, options?: HttpRequestOptions): Promise<Response> {
        const fullRequestUrl = uri ? `${this.url}/${uri}` : this.url;
        return fetch(new Request(fullRequestUrl, {
            method: 'PUT',
            headers: this.generateFullHeaders(options.headers),
            body: this.generateRequestBodyString(body),
        }));
    }

    delete(uri?: string, options?: HttpRequestOptions): Promise<Response> {
        const fullRequestUrl = uri ? `${this.url}/${uri}` : this.url;
        return fetch(new Request(fullRequestUrl, {
            method: 'DELETE',
            headers: this.generateFullHeaders(options.headers)
        }));
    }

    head(uri?: string, options?: HttpRequestOptions): Promise<Response> {
        const requestUrl = uri ? `${this.url}/${uri}` : this.url;
        return fetch(new Request(requestUrl, {
            method: 'HEAD',
            headers: this.generateFullHeaders(options.headers)
        }));
    }
}
