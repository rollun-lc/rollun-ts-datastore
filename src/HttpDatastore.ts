import {DatastoreInterface, HttpClientInterface} from "./interfaces";
import Query from "rollun-ts-rql/src/Query";
import BasicHttpClient from "./BasicHttpClient";

export interface HttpDatastoreOptions {

}

export default class HttpDatastore<T> implements DatastoreInterface<T> {
    readonly identifier = 'id';
    protected client;

    constructor(url: string, options: HttpDatastoreOptions = {}, client: HttpClientInterface = BasicHttpClient) {
        this.client = new client(url, options)
    }

    read(id: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.client.get({}, `/${id}`)
                .then(response => response.json())
                .then(item => resolve(item))
                .catch((error) => {
                    reject(error)
                })
        });
    }

    has(id: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.get({}, `/${id}`)
                .then(response => response.isOk ? resolve(true) : resolve(false))
                .catch((error) => {
                    reject(error)
                })
        })
    }

    query(query: Query): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.client.get({}, `?${query}`)
                .then(response => response.json())
                .then(items => resolve(items))
                .catch((error) => {
                    reject(error)
                })
        });
    }

    create(item: T): Promise<T> {
        return new Promise((resolve, reject) => {
            this.client.post({}, item)
                .then(response => response.json())
                .then(item => resolve(item))
                .catch((error) => {
                    reject(error)
                })
        });
    }

    update(item: T): Promise<T> {
        return new Promise((resolve, reject) => {
            this.client.put({}, item)
                .then(response => response.json())
                .then(item => resolve(item))
                .catch((error) => {
                    reject(error)
                })
        });
    }

    delete(id: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.client.get({}, `/${id}`)
                .then(response => response.isOk ? resolve(true) : resolve(false))
                .catch((error) => {
                    reject(error)
                })
        })
    }

}
