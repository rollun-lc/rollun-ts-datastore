import { DataStoreInterface, HttpClientInterface } from './interfaces';
import Query                                       from 'rollun-ts-rql/dist/Query';
import BrowserClient                               from './httpClients/BrowserClient';
import QueryStringifier                            from 'rollun-ts-rql/dist/QueryStringifier';

export interface HttpDataStoreOptions {
	client?: HttpClientInterface;
	idField?: string;
	timeout?: number;
}

export default class HttpDatastore<T = any> implements DataStoreInterface<T> {
	readonly identifier;
	protected readonly client: HttpClientInterface;
	protected readonly timeout: number;

	constructor(url?: string, options: HttpDataStoreOptions = {}) {
		this.identifier = options.idField || 'id';
		this.client = options.client || new BrowserClient<T>(url);
		this.timeout = options.timeout || 0;
	}

	read(id: string): Promise<T> {
		return new Promise((resolve, reject) => {
			this.client.get(`/${id}`, {timeout: this.timeout})
				.then(response => response.json())
				.then(item => resolve(item))
				.catch((error) => {
					reject(error);
				});
		});
	}

	has(id: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.client.get(`/${id}`, {timeout: this.timeout})
				.then(response => response.json())
				.then(response => response ? resolve(true) : resolve(false))
				.catch((error) => {
					reject(error);
				});
		});
	}

	query<U = T>(query = new Query({})): Promise<Array<U>> {
		return new Promise((resolve, reject) => {
			this.client.get(`?${QueryStringifier.stringify(query)}`, {timeout: this.timeout})
				.then(response => response.json())
				.then(items => resolve(items))
				.catch((error) => {
					reject(error);
				});
		});
	}

	create(item: T): Promise<T> {
		return new Promise((resolve, reject) => {
			this.client.post('', item, {timeout: this.timeout})
				.then(response => response.json())
				.then(item => resolve(item))
				.catch((error) => {
					reject(error);
				});
		});
	}

	update<S = T>(item: S): Promise<T> {
		return new Promise((resolve, reject) => {
			this.client.put(`/${encodeURI(item[this.identifier])}`, item, {timeout: this.timeout})
				.then(response => response.json())
				.then(item => resolve(item))
				.catch((error) => {
					reject(error);
				});
		});
	}

	delete(id: string): Promise<T> {
		return new Promise((resolve, reject) => {
			this.client.delete(`/${id}`, {timeout: this.timeout})
				.then(response => response.json())
				.then(item => resolve(item))
				.catch((error) => {
					reject(error);
				});
		});
	}

	count(): Promise<number> {
		return new Promise((resolve, reject) => {
			this.client.get('?limit(1)', {
					headers: {
						'With-Content-Range': '*'
					},
					timeout: this.timeout
				}
			).then(response => resolve(this.getItemCount(response)))
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
