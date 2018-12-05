import Query from 'rollun-ts-rql/src/Query'

export interface ReadInterface {
    readonly identifier: string;

    read(id: string): Promise<any>

    has(id: string): Promise<boolean>

    query(query: Query): Promise<any>

    count(): Promise<number>
}

export interface DatastoreInterface extends ReadInterface {
    create(item: {}): Promise<any>

    update(item: {}): Promise<any>

    delete(id: string): Promise<any>

}

export interface HttpClientInterface {
    get(uri?: string, options?: {}): Promise<Response>

    post(uri?: string, options?: {}): Promise<Response>

    put(uri?: string, options?: {}): Promise<Response>

    delete(uri?: string, options?: {}): Promise<Response>
}
