import { Query } from 'rollun-ts-rql';

export interface ReadInterface<T = {}> {
	readonly identifier: string;

	read(id: string): Promise<T>;

	has(id: string): Promise<boolean>;

	query(query?: Query): Promise<Array<T>>;

	count(): Promise<number>;
}

export interface DataStoreInterface<T = {}> extends ReadInterface<T> {
	create(item: T): Promise<T>;

	update(item: T): Promise<T>;

	delete(id: string): Promise<T>;
}

export interface HttpRequestOptions {
	timeout?: number;
	headers?: { [headerName: string]: string };
}

export interface HttpClientInterface<T = {}> {
	get(uri?: string, options?: HttpRequestOptions): Promise<Response>;

	post(uri?: string, body?: string | T, options?: HttpRequestOptions): Promise<Response>;

	put(uri?: string, body?: string | T, options?: HttpRequestOptions): Promise<Response>;

	delete(uri?: string, options?: HttpRequestOptions): Promise<Response>;

	head(uri?: string, options?: HttpRequestOptions): Promise<Response>;
}
