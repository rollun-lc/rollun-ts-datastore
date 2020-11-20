import { DataStoreInterface, HttpClientInterface } from './interfaces';
import BrowserClient                               from './httpClients/BrowserClient';
import { QueryStringifier, Query }                 from 'rollun-ts-rql';

export interface HttpDataStoreOptions {
	client?: HttpClientInterface;
	idField?: string;
	timeout?: number;
	headers?: { [key: string]: string };
}

export default class HttpDatastore<T = any> implements DataStoreInterface<T> {
	readonly identifier;
	protected readonly client: HttpClientInterface;
	protected readonly timeout: number;

	constructor(url?: string, { idField = 'id', client, timeout = 0, headers = {} }: HttpDataStoreOptions = {}) {
		this.identifier = idField;
		this.client     = client || new BrowserClient<T>(url, { timeout, headers });
	}

	read(id: string): Promise<T> {
		return new Promise((resolve, reject) => {
			this.client.get(`/${ id }`)
				.then(response => response.json())
				.then(resolve)
				.catch(reject);
		});
	}

	has(id: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.client.get(`/${ id }`)
				.then(response => response.json())
				.then(response => resolve(!!response))
				.catch(reject);
		});
	}

	query<U = T>(query = new Query({})): Promise<Array<U>> {
		return new Promise((resolve, reject) => {
			this.client.get(`?${ QueryStringifier.stringify(query) }`)
				.then(response => response.json())
				.then(resolve)
				.catch(reject);
		});
	}

	create(item: Partial<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.client.post('', item)
				.then(response => response.json())
				.then(resolve)
				.catch(reject);
		});
	}

	update(item: Partial<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.client.put('', item)
				.then(response => response.json())
				.then(resolve)
				.catch(reject);
		});
	}

	delete(id: string): Promise<T> {
		return new Promise((resolve, reject) => {
			this.client.delete(`/${ encodeURIComponent(id) }`)
				.then(response => response.json())
				.then(resolve)
				.catch(reject);
		});
	}

	count(): Promise<number> {
		return new Promise((resolve, reject) => {
			this.client.get('?limit(1)', {
					headers: {
						'With-Content-Range': '*'
					}
				}
				)
				.then(response => resolve(this.getItemCount(response)))
				.catch(reject);
		});
	}

	rewrite(item: Partial<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.client.post('', item, {
					headers: {
						'If-Match': '*'
					}
				})
				.then(response => response.json())
				.then(resolve)
				.catch(reject);
		});
	}

	protected getItemCount(response: Response): number {
		const responseHeader: string = response.headers.get('Content-Range');
		return parseInt(responseHeader.split('/')[1], 10);
	}
}
