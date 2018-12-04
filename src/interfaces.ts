import Query from 'rollun-ts-rql/src/Query'

export interface ReadInterface<T> {
    readonly identifier: string;

    read(id: string): Promise<T>

    has(id: string): Promise<boolean>

    query(query: Query): Promise<T[]>
}

export interface DatastoreInterface<T> extends ReadInterface<T> {
    create(item: T): Promise<T>

    update(item: T):Promise<T>

    delete(id: string): Promise<T>

}

export interface HttpClientInterface {
    constructor(url: string, options?: {})
    get(query?: string, options?: {}): Promise<Response>
    post(options: {}): Promise<Response>
    put(options: {}): Promise<Response>
    delete(options: {}): Promise<Response>
}
