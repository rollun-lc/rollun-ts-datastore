import { DataStoreInterface, HttpClientInterface } from './interfaces';
import { QueryStringifier, Query } from 'rollun-ts-rql';
import { default as Axios, AxiosInstance, AxiosResponse } from 'axios';

export interface HttpDataStoreOptions {
	client?: HttpClientInterface;
	idField?: string;
	timeout?: number;
	headers?: { [key: string]: string };
}

export default class HttpDatastore<T = any> implements DataStoreInterface<T> {
	readonly identifier;
	protected readonly client: AxiosInstance;
	protected readonly timeout: number;

	constructor(
		private url?: string,
		{ idField = 'id', timeout = 0, headers = {} }: HttpDataStoreOptions = {}
	) {
		this.identifier = idField;
		this.client = Axios.create({
			baseURL: url,
			timeout,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				...headers,
			},
		});
	}

	read(id: string): Promise<T> {
		return this.client.get(`${this.url}/${ id }`).then(res => res.data);
	}

	async has(id: string): Promise<boolean> {
		const { data } = await this.client.get(`${this.url}/${ id }`);
		return !!data;
	}

	query<U = T>(query = new Query({})): Promise<Array<U>> {
		return this.client.get(`${this.url}?${ QueryStringifier.stringify(query) }`).then(res => res.data)
	}

	async create(item: Partial<T>): Promise<T> {
		return this.client.post(this.url, item).then(res => res.data);
	}

	update(item: Partial<T>): Promise<T> {
		return this.client.put(this.url, item).then(res => res.data);
	}

	delete(id: string): Promise<T> {
		return this.client.delete(`${this.url}/${ encodeURIComponent(id) }`).then(res => res.data);
	}

	count(): Promise<number> {
		return this.client
			.get(`${this.url}?limit(1)`, {
				headers: {
					'With-Content-Range': '*',
				},
			})
			.then((response) => this.getItemCount(response));
	}

	rewrite(item: Partial<T>): Promise<T> {
		return this.client
			.post(this.url, item, {
				headers: {
					'If-Match': '*',
				},
			})
			.then((response) => response.data);
	}

	protected getItemCount(response: AxiosResponse): number {
		const responseHeader: string = response.headers['Content-Range'];
		return parseInt(responseHeader.split('/')[1], 10);
	}
}
