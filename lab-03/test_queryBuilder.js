// Unit tests for queryBuilder.js (no server or database needed). Run: npm run test:unit
const assert = require('assert');
const { parseListQuery, validateBook, isValidId } = require('./queryBuilder');

let passed = 0;
const test = (name, fn) => {
  fn();
  passed += 1;
  console.log(`ok  ${name}`);
};

test('defaults', () => {
  const q = parseListQuery({});
  assert.deepStrictEqual(
    [q.where, q.orderBy, q.order, q.limit, q.offset],
    ['', 'id', 'ASC', 10, 0]
  );
});
test('search uses LIKE with a parameter', () => {
  const q = parseListQuery({ search_q: 'java' });
  assert.ok(q.where.includes('title LIKE ?'));
  assert.deepStrictEqual(q.params, ['%java%']);
});
test('LIKE wildcards typed by the user are escaped', () => {
  assert.deepStrictEqual(parseListQuery({ search_q: '50%' }).params, ['%50\\%%']);
});
test('both prices use BETWEEN', () => {
  const q = parseListQuery({ min_price: '1000', max_price: '3000' });
  assert.ok(q.where.includes('price BETWEEN ? AND ?'));
  assert.deepStrictEqual(q.params, [1000, 3000]);
});
test('single price bound', () => {
  assert.ok(parseListQuery({ min_price: '1000' }).where.includes('price >= ?'));
  assert.ok(parseListQuery({ max_price: '1000' }).where.includes('price <= ?'));
});
test('order is case-insensitive', () => assert.strictEqual(parseListQuery({ order: 'desc' }).order, 'DESC'));

const bad = [
  [{ order_by: 'id; DROP TABLE book' }, 'order_by'],
  [{ order: 'sideways' }, 'order'],
  [{ limit: '0' }, 'limit'],
  [{ limit: '101' }, 'limit'],
  [{ limit: 'abc' }, 'limit'],
  [{ limit: ['1', '2'] }, 'limit'],
  [{ offset: '-1' }, 'offset'],
  [{ min_price: 'cheap' }, 'min_price'],
  [{ max_price: '-5' }, 'max_price'],
  [{ min_price: '500', max_price: '100' }, 'min_price'],
];
bad.forEach(([query, word]) =>
  test(`rejects ${JSON.stringify(query)}`, () => {
    const q = parseListQuery(query);
    assert.ok(q.error && q.error.includes(word), q.error);
  })
);

const good = { title: 'T', author: 'A', price: 10 };
test('valid book', () => assert.strictEqual(validateBook(good), null));
test('missing title', () => assert.ok(validateBook({ ...good, title: undefined })));
test('blank author', () => assert.ok(validateBook({ ...good, author: '  ' })));
test('price as text', () => assert.ok(validateBook({ ...good, price: '10' })));
test('missing price', () => assert.ok(validateBook({ ...good, price: undefined })));
test('negative price', () => assert.ok(validateBook({ ...good, price: -1 })));
test('bad pages', () => assert.ok(validateBook({ ...good, pages: 0 })));
test('no body', () => assert.ok(validateBook(undefined)));
test('ids', () => {
  assert.ok(isValidId('7'));
  ['0', '-1', 'abc', '1.5', '1; DROP'].forEach((v) => assert.ok(!isValidId(v), v));
});

console.log(`\n${passed} tests passed`);
