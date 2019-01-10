import { DataStoreInterface, HttpClientInterface } from './interfaces';
import Query from 'rollun-ts-rql/dist/Query';
import BrowserClient from './httpClients/BrowserClient';
import QueryStringifier from 'rollun-ts-rql/dist/QueryStringifier';

export interface HttpDataStoreOptions {
	client?: HttpClientInterface;
}

export default class HttpDatastore implements DataStoreInterface {
	readonly identifier = 'id';
	protected client: HttpClientInterface;

	constructor(url?: string, options: HttpDataStoreOptions = {}) {
		this.client = options.client ? options.client : new BrowserClient(url);
	}

	read(id: string): Promise<{}> {
		return new Promise((resolve, reject) => {
			this.client.get(`/${id}`)
				.then(response => response.json())
				.then(item => resolve(item))
				.catch((error) => {
					reject(error);
				});
		});
	}

	has(id: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.client.get(`/${id}`)
				.then(response => response.ok ? resolve(true) : resolve(false))
				.catch((error) => {
					reject(error);
				});
		});
	}

	query(query: Query): Promise<{}[]> {
		return new Promise((resolve, reject) => {
			this.client.get(`?${QueryStringifier.stringify(query)}`)
				.then(response => response.json())
				.then(items => resolve(items))
				.catch((error) => {
					reject(error);
				});
		});
	}

	create(item: {}): Promise<{}> {
		return new Promise((resolve, reject) => {
			this.client.post('', item)
				.then(response => response.json())
				.then(item => resolve(item))
				.catch((error) => {
					reject(error);
				});
		});
	}

	update(item: {}): Promise<{}> {
		return new Promise((resolve, reject) => {
			this.client.put(`/${item[this.identifier]}`, item)
				.then(response => response.json())
				.then(item => resolve(item))
				.catch((error) => {
					reject(error);
				});
		});
	}

	delete(id: string): Promise<{}> {
		return new Promise((resolve, reject) => {
			this.client.delete(`/${id}`)
				.then(response => response.json())
				.then(item => resolve(item))
				.catch((error) => {
					reject(error);
				});
		});
	}

	count(): Promise<number> {
		return new Promise((resolve, reject) => {
			this.client.get('?limit(1)')
				.then(response => resolve(this.getItemCount(response)))
				.catch((error) => {
					reject(error);
				});
		});
	}

	protected getItemCount(response: Response): number {
		const responseHeader: string = response.headers.get('Content-Range');
		return parseInt(responseHeader.split('/')[1], 10);
	}
}
