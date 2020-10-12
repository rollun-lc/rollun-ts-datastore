import LocalDatastore from '../src/LocalDatastore';

import {
  Query,
  Limit,
  Select,
  Sort,
  GroupBy,
  And,
  Or,
  Eq,
  Ge,
  Le,
  In,
  Out
} from 'rollun-ts-rql';


const initialData = [
  { id: 1, text: '1123' },
  { id: 3, text: '1123' },
  { id: 2, text: '2123' },
  { id: 4, text: '4123' },
  { id: 5, text: '5123' }
];

const client = new LocalDatastore({ initialData });

describe('Local data store basic tests', () => {
  describe('read', () => {
    test('item exists', done => {
      client
        .read(2)
        .then(res => {
          expect(res).toStrictEqual({ id: 2, text: '2123' });
          done();
        });
    });
    test('item does not  exists', done => {
      client
        .read(-1)
        .then(res => {
          expect(res).toBeUndefined();
          done();
        });
    });
  });
  describe('has', () => {
    test('item exists', done => {
      client
        .has(2)
        .then(res => {
          expect(res).toBe(true);
          done();
        });
    });
    test('item does not exists', done => {
      client
        .has(-1)
        .then(res => {
          expect(res).toBe(false);
          done();
        });
    });
  });
  describe('create', () => {
    test('item does not exists', done => {
      const newItem = { id: 10, text: '1234' };
      client
        .create(newItem)
        .then(res => {
          expect(res).toStrictEqual(newItem);
          done();
        });
    });
    test('item exists', done => {
      const newItem = { id: 10, text: '1234' };
      client
        .create(newItem)
        .catch(err => {
          expect(err).toBeTruthy();
          done();
        });
    });
    test('item without id', done => {
      const newItem = { not_id: 5, text: '1234' };
      client
        // @ts-ignore
        .create(newItem)
        .catch(err => {
          expect(err).toBeTruthy();
          done();
        });
    });
  });
  describe('count', () => {
    test('basic', done => {
      client
        .count()
        .then(res => {
          expect(res).toBe(6);
          done();
        });
    });
  });
  describe('delete', () => {
    test('existing item', done => {
      client
        .delete(1)
        .then(res => {
          expect(res).toStrictEqual({ id: 1, text: '1123' });
          done();
        });
    });
    test('not existing item', done => {
      client
        .delete(42)
        .catch(err => {
          expect(err).toBeTruthy();
          done();
        });
    });
  });
  describe('update', () => {
    test('existing item', done => {
      const updatedItem = { id: 5, text: 'new text' };
      client
        .update(updatedItem)
        .then(res => {
          expect(res).toStrictEqual({ id: 5, text: 'new text' });
          done();
        });
    });
    test('not existing item', done => {
      const updatedItem = { id: 42, text: 'new text' };
      client
        .update(updatedItem)
        .catch(err => {
          expect(err).toBeTruthy();
          done();
        });
    });
    test('item without key', done => {
      const updatedItem = { not_id: 4, text: 'new text' };
      client
        // @ts-ignore
        .update(updatedItem)
        .catch(err => {
          expect(err).toBeTruthy();
          done();
        });
    });
  });
  describe('query', () => {
    test('empty query', async (done) => {
      const expectedData = [
        { id: 3, text: '1123' },
        { id: 2, text: '2123' },
        { id: 4, text: '4123' },
        { id: 5, text: 'new text' },
        { id: 10, text: '1234' } ];
      client
        .query()
        .then(res => {
          expect(res).toStrictEqual(expectedData);
          done();
        });
    });
    test('limit(2,0)', done => {
      const expectedData = [
        { id: 3, text: '1123' },
        { id: 2, text: '2123' },
        { id: 4, text: '4123' }
      ];
      client
        .query(new Query({
          limit: new Limit(3, 0)
        }))
        .then(res => {
          expect(res).toStrictEqual(expectedData);
          done();
        });
    });
    test('select (existing fields) & limit(2,0)', done => {
      const expectedData = [
        { text: '1123' },
        { text: '2123' }
      ];
      client
        .query(new Query({
          select: new Select([ 'text' ]),
          limit:  new Limit(2, 0)
        }))
        .then(res => {
          expect(res).toStrictEqual(expectedData);
          done();
        });
    });
    test('select (not existing fields)', done => {
      client
        .query(new Query({
          select: new Select([ 'not_exist' ])
        }))
        .catch(err => {
          expect(err).toBeTruthy();
          done();
        });
    });
    test('sort', done => {
      const expectedData = [ { id: 3, text: '1123' },
        { id: 10, text: '1234' },
        { id: 2, text: '2123' },
        { id: 4, text: '4123' },
        { id: 5, text: 'new text' } ]
      ;
      client
        .query(new Query({ sort: new Sort({ text: 1 }) }))
        .then(res => {
          expect(res).toStrictEqual(expectedData);
          done();
        });
    });
    test('sort by not existing field', done => {
      client
        .query(new Query({ sort: new Sort({ does_not_exists: 1 }) }))
        .catch(err => {
          expect(err).toBeTruthy();
          done();
        });
    });
    const ds = new LocalDatastore({ initialData });
    test('And', done => {
      const expectedData = [ { id: 3, text: '1123' } ];
      ds.query(new Query({
          query: new And([
            new Eq('id', 3),
            new Eq('text', '1123') ])
        }))
        .then(res => {
          expect(res).toStrictEqual(expectedData);
          done();
        });
    });
    test('Or', done => {
      const expectedData = [
        { id: 1, text: '1123' },
        { id: 3, text: '1123' },
        { id: 5, text: '5123' }
      ];
      ds.query(new Query({
          query: new Or([
            new Eq('id', 5),
            new Eq('text', '1123') ])
        }))
        .then(res => {
          expect(res).toStrictEqual(expectedData);
          done();
        });
    });
    describe('scalar nodes', () => {
      const expectedData = [
        { id: 3, text: '1123' },
        { id: 4, text: '4123' },
        { id: 5, text: '5123' }
      ];
      test('Ge', done => {
        ds.query(new Query({
            query: new Ge('id', 3)
          }))
          .then(res => {
            expect(res).toStrictEqual(expectedData);
            done();
          });
      });
      test('Le', done => {
        const expectedData = [
          { id: 1, text: '1123' },
          { id: 3, text: '1123' },
          { id: 2, text: '2123' }
        ];
        ds.query(new Query({
            query: new Le('id', 3)
          }))
          .then(res => {
            expect(res).toStrictEqual(expectedData);
            done();
          });
      });
    });
    describe('array nodes', () => {
      test('in', done => {
        const expectedData = [
          { id: 1, text: '1123' },
          { id: 3, text: '1123' },
          { id: 2, text: '2123' }
        ];
        ds.query(new Query({
            query: new In('text', [ '1123', '2123' ])
          }))
          .then(res => {
            expect(res).toStrictEqual(expectedData);
            done();
          });
      });
      test('out', done => {
        const expectedData = [
          { id: 4, text: '4123' },
          { id: 5, text: '5123' }
        ];
        ds.query(new Query({
            query: new Out('text', [ '1123', '2123' ])
          }))
          .then(res => {
            expect(res).toStrictEqual(expectedData);
            done();
          });
      });
    });
    const initialData1 = [
      { id: 1, text: '111', text1: '777' },
      { id: 2, text: '111', text1: '777' },
      { id: 3, text: '111', text1: '888' },
      { id: 4, text: '411', text1: '999' }
    ];
    const ds1          = new LocalDatastore({ initialData: initialData1 });
    describe('GroupBy node', () => {
      test('existed fields', done => {
        const expectedData = [ { id: 1, text: '111', text1: '777' },
          { id: 3, text: '111', text1: '888' },
          { id: 4, text: '411', text1: '999' } ];
        ds1
          .query(new Query({
            group: new GroupBy([ 'text', 'text1' ])
          }))
          .then(res => {
            expect(res).toStrictEqual(expectedData);
            done();
          });
      });
      test('not existed fields', done => {
        ds1
          .query(new Query({
            group: new GroupBy([ 'not_existed_field' ])
          }))
          .catch(res => {
            expect(res).toBeTruthy();
            done();
          });
      });
    });
  });
});
