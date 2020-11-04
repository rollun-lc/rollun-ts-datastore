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
				.then(item => resolve(item))
				.catch((error) => {
					reject(error);
				});
		});
	}

	has(id: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.client.get(`/${ id }`)
				.then(response => response.json())
				.then(response => response ? resolve(true) : resolve(false))
				.catch((error) => {
					reject(error);
				});
		});
	}

	query<U = T>(query = new Query({})): Promise<Array<U>> {
		return new Promise((resolve, reject) => {
			this.client.get(`?${ QueryStringifier.stringify(query) }`)
				.then(response => response.json())
				.then(items => resolve(items))
				.catch((error) => {
					reject(error);
				});
		});
	}

	create(item: Partial<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.client.post('', item)
				.then(response => response.json())
				.then(item => resolve(item))
				.catch((error) => {
					reject(error);
				});
		});
	}

	update(item: Partial<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.client.put(`/${ encodeURI(item[this.identifier]) }`, item)
				.then(response => response.json())
				.then(item => resolve(item))
				.catch((error) => {
					reject(error);
				});
		});
	}

	delete(id: string): Promise<T> {
		return new Promise((resolve, reject) => {
			this.client.delete(`/${ id }`)
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

	rewrite(item: Partial<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.client.post('', item, {
					headers: {
						'If-Match': '*'
					}
				})
				.then(response => response.json())
				.then(item => resolve(item))
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
