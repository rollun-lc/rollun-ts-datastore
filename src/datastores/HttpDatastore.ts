import { DataStoreInterface, HttpClientInterface } from './interfaces';
import { QueryStringifier, Query } from 'rollun-ts-rql';
import axios, { AxiosResponse } from 'axios';

export interface HttpDataStoreOptions {
  client?: HttpClientInterface;
  idField?: string;
  timeout?: number;
  headers?: { [key: string]: string };
}

export default class HttpDatastore<T = any> implements DataStoreInterface<T> {
  readonly identifier;
  protected readonly timeout: number;
  private url = '';

  constructor(
    url: string,
    { idField = 'id', timeout = 0, headers = {} }: HttpDataStoreOptions = {}
  ) {
    this.identifier = idField;
    this.url = url;
  }

  read(id: string): Promise<T> {
    return axios.get(`${this.url}/${id}`).then((res) => res.data);
  }

  async has(id: string): Promise<boolean> {
    const { data } = await axios.get(`${this.url}/${id}`);
    return !!data;
  }

  query<U = T>(query = new Query({})): Promise<Array<U>> {
    return axios
      .get(`${this.url}?${QueryStringifier.stringify(query)}`)
      .then((res) => res.data);
  }

  async create(item: Partial<T>): Promise<T> {
    return axios.post(this.url, item).then((res) => res.data);
  }

  update(item: Partial<T>): Promise<T> {
    return axios.put(this.url, item).then((res) => res.data);
  }

  delete(id: string): Promise<T> {
    return axios
      .delete(`${this.url}/${encodeURIComponent(id)}`)
      .then((res) => res.data);
  }

  count(): Promise<number> {
    return axios
      .get(`${this.url}?limit(1)`, {
        headers: {
          'With-Content-Range': '*',
        },
      })
      .then((response) => this.getItemCount(response));
  }

  rewrite(item: Partial<T>): Promise<T> {
    return axios
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
