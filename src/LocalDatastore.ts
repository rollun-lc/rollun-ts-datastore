import { DataStoreInterface } from './interfaces';
import { Query }              from 'rollun-ts-rql';
import LocalDataClient        from './LocalClient/LocalDataClient';

export interface LocalDataStoreOptions<T> {
  idField?: string;
  initialData?: Array<T>;
}

export default class LocalDatastore<T = any> implements DataStoreInterface<T> {
  readonly identifier: string = '';
  readonly client: LocalDataClient<T>;

  constructor(options?: LocalDataStoreOptions<T>) {
    this.client = new LocalDataClient<T>(options);
  }

  count(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      try {
        resolve(this.client.getDataLength());
      } catch (e) {
        reject(e);
      }
    });
  }

  create(item: T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      try {
        resolve(this.client.create(item));
      } catch (e) {
        reject(e);
      }
    });
  }

  delete(id: string | number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      try {
        resolve(this.client.delete(id));
      } catch (e) {
        reject(e);
      }
    });
  }

  has(id: string | number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        resolve(!!this.client.read(id));
      } catch (e) {
        reject(e);
      }
    });
  }

  query<U = T>(query?: Query): Promise<Array<U>> {
    return new Promise<Array<U>>((resolve, reject) => {
      try {
        resolve(this.client.get(query));
      } catch (e) {
        reject(e);
      }
    });
  }

  read(id: string | number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      try {
        resolve(this.client.read(id));
      } catch (e) {
        reject(e);
      }
    });
  }

  update<U = T>(item: T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      try {
        resolve(this.client.update(item));
      } catch (e) {
        reject(e);
      }
    });
  }

  rewrite(item: T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      try {
        if (this.client.read(item[this.identifier])) {
          resolve(this.client.update(item));
        } else {
          resolve(this.client.create(item));
        }
      } catch (e) {
        reject(e);
      }
    });
  }
}
