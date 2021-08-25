import BrowserClient from '../dist/httpClients/BrowserClient';
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

const path = '/valid';
beforeEach(() => {
	nock(url).get(path).reply(200, 'get_text');
	nock(url).post(path).reply(201, 'post_text');
	nock(url).put(path).reply(201, 'put_text');
	nock(url).delete(path).reply(200, 'delete_text');
	nock(url).head(path).reply(200, 'head_text');
});
const methods = [
	{name: 'get', resCode: 200, resText: 'get_text'},
	{name: 'post', resCode: 201, resText: 'post_text'},
	{name: 'put', resCode: 201, resText: 'put_text'},
	{name: 'delete', resCode: 200, resText: 'delete_text'},
	{name: 'head', resCode: 200, resText: 'head_text'}];
methods.forEach((method) => {
	test(`${method.name} request`, () => {
		client[method.name](path).then((res) => res.text())
			.then(res => {
				expect(res).toEqual(method.resText);
			})
			.catch(err => {
				throw ('Expected resolve promise');
			});
	});
});
