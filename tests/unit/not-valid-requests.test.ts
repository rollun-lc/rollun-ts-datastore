import { expect }    from 'chai';
import BrowserClient from '../../src/httpClients/BrowserClient';
import { describe }  from 'mocha';

const nock = require('nock');

const client = new BrowserClient('https://test.datastore');
const url = 'https://test.datastore';

describe('Test not valid requests', () => {
    const path = '/not-valid-path';
    before(() => {
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
        it(`Not valid ${method.name} request`, () => {
            client[method.name](path)
                .then(res => {
                    throw ('Expected reject promise');
                })
                .catch(err => expect(err.status).to.be.equal(method.resCode));
        });
    });
});
