import intern from 'intern';
import * as fetchMock from 'fetch-mock/src/server';
import BrowserClient from '../../../src/httpClients/NodeClient';

const {suite, test, before, after} = intern.getPlugin('interface.tdd');
const {assert} = intern.getPlugin('chai');

const client = new BrowserClient('http://test123321.com');
suite('HTTP Datastore', () => {
	before(() => {
		fetchMock
			.get('http://test123321.com/my-resource/api/datastore', 200, 'got my-resource')
			.post('http://test123321.com/api/datastore', 201, 'post success')
			.put('http://test123321.com/api/datastore/1233', 201, 'put success')
			.delete('http://test123321.com/api/datastore/1233', 200, 'delete success')
			.head('http://test123321.com/api/datastore', 200, 'head success');
	});
	test('Request Building', () => {
		client.get('1233')
			.then(response => response.text())
			.then((text) => {
				assert.equal('got my-resource', text, 'GET request');
			});
		client.post('')
			.then(response => response.text())
			.then((text) => {
				assert.equal('post success', text, 'POST request');
			});
		client.put('1233')
			.then(response => response.text())
			.then((text) => {
				assert.equal('put success', text, 'PUT request');
			});
		client.delete('1233')
			.then(response => response.text())
			.then((text) => {
				assert.equal('delete success', text, 'DELETE request');
			});
		client.head('1233')
			.then(response => response.text())
			.then((text) => {
				assert.equal('head success', text, 'HEAD request');
			});
	});
	after(() => {
		fetchMock.reset();
	});
});
