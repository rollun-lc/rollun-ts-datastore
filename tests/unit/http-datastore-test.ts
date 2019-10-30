import BrowserClient           from '../../src/httpClients/BrowserClient';
import { assert }              from 'chai';
import { describe }            from 'mocha';
import { HttpClientInterface } from '../../src/interfaces';
import HttpDatastore           from '../../src/HttpDatastore';
import { Response }            from 'node-fetch';
import Limit                   from 'rollun-ts-rql/dist/nodes/Limit';
import Query                   from 'rollun-ts-rql/dist/Query';

const _ = require('lodash');
const nock = require('nock');

const client = new BrowserClient('https://test.datastore');
const url = 'https://test.datastore';

const testClient: HttpClientInterface = {
    get(uri?: string, options: {} = {}): Promise<Response> {
        switch (uri) {
            case '/1233':
                return new Promise((resolve, reject) => {
                    resolve(new Response('{"id":"1233"}', {
                        status: 201,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }));
                });

            case '?limit(10,0)': {
                return new Promise((resolve, reject) => {
                    const responseData = [
                        {id: '1233', data: {a: 1, b: 2}},
                        {id: '1672', data: {a: 2, b: 3}}
                    ];
                    resolve(new Response(JSON.stringify(responseData), {
                        status: 201,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }));
                });
            }
            case '?limit(1)': {
                return new Promise((resolve, reject) => {
                    const responseData = [
                        {id: '1233', data: {a: 1, b: 2}}
                    ];
                    resolve(new Response(JSON.stringify(responseData), {
                        status: 201,
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Range': 'items 0-1/3'
                        }
                    }));
                });
            }
        }
    },
    post(uri?: string, body?: {}, options: {} = {}): Promise<Response> {
        assert.isTrue(_.isEqual(body, {id: '1233'}), 'POST: request body is valid');
        return new Promise((resolve, reject) => {
            resolve(new Response('{"id":"1233"}', {
                status: 201,
                headers: {
                    'Content-Type': 'application/json'
                }
            }));
        });
    },
    put(uri?: string, body?: {}, options: {} = {}): Promise<Response> {
        assert.isTrue(_.isEqual(body, {id: '1233', data: {a: 1, b: 2}}), 'PUT: request body is valid');
        return new Promise((resolve, reject) => {
            resolve(new Response('{"id":"1233","data":{"a":1,"b":2}}', {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }));
        });
    },
    delete(uri?: string, options: {} = {}): Promise<Response> {
        return new Promise((resolve, reject) => {
            resolve(new Response('{"id":"1233","data":{"a":1,"b":2}}', {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }));
        });
    },
    head(uri?: string, options: {} = {}): Promise<Response> {
        return new Promise((resolve, reject) => {
            resolve(new Response('', {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }));
        });
    }
};

const datastore = new HttpDatastore('', {client: testClient});

describe('Test HttpDatastore', () => {
    it('create', () => {
        return new Promise((resolve, reject) => {
            try {
                datastore.create({id: '1233'}).then((item) => {
                    assert.isTrue(_.isEqual(item, {id: '1233'}), '"read" works correctly');
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    });
    it('read', () => {
        return new Promise((resolve, reject) => {
            try {
                datastore.read('1233').then((item) => {
                    assert.isTrue(_.isEqual(item, {id: '1233'}), '"read" works correctly');
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    });
    it('update', () => {
        return new Promise((resolve, reject) => {
            try {
                datastore.update({
                    id: '1233',
                    data: {
                        a: 1,
                        b: 2
                    }
                }).then((item) => {
                    assert.isTrue(_.isEqual(item, {
                        id: '1233',
                        data: {
                            a: 1,
                            b: 2
                        }
                    }), '"update" works correctly');
                    resolve();

                });
            } catch (error) {
                reject(error);
            }
        });
    });
    it('delete', () => {
        return new Promise((resolve, reject) => {
            try {
                datastore.delete('1233').then((item) => {
                    assert.isTrue(_.isEqual(item, {
                        id: '1233',
                        data: {
                            a: 1,
                            b: 2
                        }
                    }), '"delete" works correctly');
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    });
    it('query', () => {
        return new Promise((resolve, reject) => {
            try {
                datastore.query(new Query({limit: new Limit(10, 0)})).then(
                    (items) => {
                        assert.isTrue(_.isEqual(items, [
                                {id: '1233', data: {a: 1, b: 2}},
                                {id: '1672', data: {a: 2, b: 3}}
                            ]),
                            '"query" works correctly');
                        resolve();
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    });
    it('count', () => {
        return new Promise((resolve, reject) => {
            try {
                datastore.count().then((count) => {
                    assert.equal(count, 3, '"count" works correctly');
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    });
});
