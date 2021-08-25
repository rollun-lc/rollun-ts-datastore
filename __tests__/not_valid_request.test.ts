import BrowserClient               from '../dist/httpClients/BrowserClient';
import fetch, { Headers, Request } from 'node-fetch';

(global as any).Headers = Headers;
(global as any).Request = Request;
(global as any).fetch = fetch;
(global as any).sessionStorage = {
	getItem: (name) => 'test',
	setItem: (name, value) => { return; }
};

const nock = require('nock');

const url = 'https://test.datastore';
const client = new BrowserClient(url);

const path = '/not-valid-path';

beforeEach(() => {
	nock(url).get(path).reply(500);
	nock(url).post(path).reply(500);
	nock(url).put(path).reply(500);
	nock(url).delete(path).reply(500);
	nock(url).head(path).reply(500);
});
const methods = [
	{name: 'get', resCode: 500},
	{name: 'post', resCode: 500},
	{name: 'put', resCode: 500},
	{name: 'delete', resCode: 500},
	{name: 'head', resCode: 500}];
methods.forEach(method => {
	test(`Not valid ${method.name} request`, () => {
		client[method.name](path)
			.then(res => {
				throw ('Expected reject promise');
			})
			.catch(err => expect(err.status).toEqual(method.resCode));
	});
});
