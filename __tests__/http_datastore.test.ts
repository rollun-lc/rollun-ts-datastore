import HttpDatastore           from '../dist/HttpDatastore';
import { Query, Limit }        from 'rollun-ts-rql';
import { Headers, Response }   from 'node-fetch';
import { HttpClientInterface } from '../dist/interfaces';

const _ = require('lodash');

// inject Headers object for testing with node.js

(global as any).Headers = Headers;

const testClient: HttpClientInterface = {
  get(uri?: string): Promise<Response> {
    switch (uri) {
      case '/1233':
        return new Promise(resolve => {
          resolve(new Response('{"id":"1233"}', {
            status:  201,
            headers: {
              'Content-Type': 'application/json'
            }
          }));
        });

      case '?limit(10,0)': {
        return new Promise(resolve => {
          const responseData = [
            { id: '1233', data: { a: 1, b: 2 } },
            { id: '1672', data: { a: 2, b: 3 } }
          ];
          resolve(new Response(JSON.stringify(responseData), {
            status:  201,
            headers: {
              'Content-Type': 'application/json'
            }
          }));
        });
      }
      case '?limit(1)': {
        return new Promise(resolve => {
          const responseData = [
            { id: '1233', data: { a: 1, b: 2 } }
          ];
          resolve(new Response(JSON.stringify(responseData), {
            status:  201,
            headers: {
              'Content-Type':  'application/json',
              'Content-Range': 'items 0-1/3'
            }
          }));
        });
      }
    }
  },
  post(): Promise<Response> {
    return new Promise(resolve => {
      resolve(new Response('{"id":"1233"}', {
        status:  201,
        headers: {
          'Content-Type': 'application/json'
        }
      }));
    });
  },
  put(): Promise<Response> {
    return new Promise(resolve => {
      resolve(new Response('{"id":"1233","data":{"a":1,"b":2}}', {
        status:  200,
        headers: {
          'Content-Type': 'application/json'
        }
      }));
    });
  },
  delete(): Promise<Response> {
    return new Promise(resolve => {
      resolve(new Response('{"id":"1233","data":{"a":1,"b":2}}', {
        status:  200,
        headers: {
          'Content-Type': 'application/json'
        }
      }));
    });
  },
  head(): Promise<Response> {
    return new Promise(resolve => {
      resolve(new Response('', {
        status:  200,
        headers: {
          'Content-Type': 'application/json'
        }
      }));
    });
  }
};

const datastore = new HttpDatastore('', { client: testClient });

test('create', () => {
  return new Promise((resolve, reject) => {
    try {
      datastore.create({ id: '1233' }).then((item) => {
        expect(_.isEqual(item, { id: '1233' })).toBeTruthy();
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
});
test('read', () => {
  return new Promise((resolve, reject) => {
    try {
      datastore.read('1233').then((item) => {
        expect(_.isEqual(item, { id: '1233' })).toBeTruthy();
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
});
test('update', () => {
  return new Promise((resolve, reject) => {
    try {
      datastore.update({
        id:   '1233',
        data: {
          a: 1,
          b: 2
        }
      }).then((item) => {
        expect(_.isEqual(item, {
          id:   '1233',
          data: {
            a: 1,
            b: 2
          }
        })).toBeTruthy();
        resolve();

      });
    } catch (error) {
      reject(error);
    }
  });
});
test('delete', () => {
  return new Promise((resolve, reject) => {
    try {
      datastore.delete('1233').then((item) => {
        expect(_.isEqual(item, {
          id:   '1233',
          data: {
            a: 1,
            b: 2
          }
        })).toBeTruthy();
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
});
test('query', done => {
  return new Promise((resolve, reject) => {
    try {
      datastore.query(new Query({ limit: new Limit(10, 0) })).then(
        (items) => {
          expect(_.isEqual(items, [
            { id: '1233', data: { a: 1, b: 2 } },
            { id: '1672', data: { a: 2, b: 3 } }
          ])).toBeTruthy();
          done();
          resolve();
        }
      );
    } catch (error) {
      reject(error);
    }
  });
});
test('count', () => {
  return new Promise((resolve, reject) => {
    try {
      datastore.count().then((count) => {
        expect(count).toEqual(3);
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
});
