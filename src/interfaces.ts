import Query from 'rollun-ts-rql/src/Query'

export interface ReadInterface {
    readonly identifier: string;

    read(id: string): Promise<any>

    has(id: string): Promise<boolean>

    query(query: Query): Promise<any>

    count(): Promise<number>
}

export interface DataStoreInterface extends ReadInterface {
    create(item: {}): Promise<any>,

    update(item: {}): Promise<any>,

    delete(id: string): Promise<any>,
}

export interface HttpRequestOptions {
    headers?: { [headerName: string]: string },
}

export interface HttpClientInterface {
    get(uri?: string, options?: {}): Promise<Response>,

    post(uri?: string, body?: string | {}, options?: HttpRequestOptions): Promise<Response>,

    put(uri?: string, body?: string | {}, options?: HttpRequestOptions): Promise<Response>,

    delete(uri?: string, options?: HttpRequestOptions): Promise<Response>,

    head(uri?: string, options?: HttpRequestOptions): Promise<Response>,
}

