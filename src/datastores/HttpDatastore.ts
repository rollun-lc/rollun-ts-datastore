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
		url?: string,
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
		return this.client.get(`/${id}`).then((response) => response.data);
	}

	has(id: string): Promise<boolean> {
		return this.client.get(`/${id}`).then((response) => !!response.data);
	}

	query<U = T>(query = new Query({})): Promise<Array<U>> {
		return this.client
			.get(`?${QueryStringifier.stringify(query)}`)
			.then((response) => response.data);
	}

	create(item: Partial<T>): Promise<T> {
		return this.client.post('', item).then((response) => response.data);
	}

	update(item: Partial<T>): Promise<T> {
		return this.client.put('', item).then((response) => response.data);
	}

	delete(id: string): Promise<T> {
		return this.client
			.delete(`/${encodeURIComponent(id)}`)
			.then((response) => response.data);
	}

	count(): Promise<number> {
		return this.client
			.get('?limit(1)', {
				headers: {
					'With-Content-Range': '*',
				},
			})
			.then((response) => this.getItemCount(response));
	}

	rewrite(item: Partial<T>): Promise<T> {
		return this.client
			.post('', item, {
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
