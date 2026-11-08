// Calls every route of a RUNNING server and checks status codes. Run: npm run test:routes
// Optional: BASE_URL=http://localhost:3000 (default). Needs Node 18+ (built-in fetch).
const BASE = process.env.BASE_URL || 'http://localhost:3000';
let failed = 0;

const call = async (label, method, path, expected, body, rawBody) => {
  const options = { method, headers: {} };
  if (body !== undefined || rawBody !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = rawBody !== undefined ? rawBody : JSON.stringify(body);
  }
  const res = await fetch(BASE + path, options);
  const data = await res.json().catch(() => ({}));
  const ok = res.status === expected;
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}: ${method} ${path} -> ${res.status} (expected ${expected})`);
  return data;
};

const run = async () => {
  await call('S0 welcome', 'GET', '/', 200);
  await call('S1 list', 'GET', '/books', 200);
  await call('S2 search', 'GET', '/books?search_q=java', 200);
  await call('S3 sort', 'GET', '/books?order_by=price&order=DESC', 200);
  await call('S4 pagination', 'GET', '/books?limit=3&offset=3', 200);
  await call('S5 price range', 'GET', '/books?min_price=2000&max_price=4000', 200);
  await call('S6 combined', 'GET', '/books?search_q=java&order_by=price&order=DESC&limit=5&min_price=1000', 200);
  await call('S7 get one', 'GET', '/books/1', 200);
  const created = await call('S8 create', 'POST', '/books', 201, { title: 'Test Book', author: 'Tester', price: 499.5, pages: 120 });
  const id = created.id;
  await call('S9 update', 'PUT', `/books/${id}`, 200, { title: 'Test Book 2', author: 'Tester', price: 599, pages: 130 });
  await call('S10 delete', 'DELETE', `/books/${id}`, 200);

  await call('F1 bad order_by', 'GET', '/books?order_by=pages;DROP', 400);
  await call('F2 bad order', 'GET', '/books?order=up', 400);
  await call('F3 limit too big', 'GET', '/books?limit=500', 400);
  await call('F4 non-numeric min_price', 'GET', '/books?min_price=abc', 400);
  await call('F5 min above max', 'GET', '/books?min_price=900&max_price=100', 400);
  await call('F6 invalid id', 'GET', '/books/abc', 400);
  await call('F7 missing id', 'GET', '/books/99999', 404);
  await call('F8 missing title', 'POST', '/books', 400, { author: 'A', price: 10 });
  await call('F9 missing author', 'POST', '/books', 400, { title: 'T', price: 10 });
  await call('F10 non-numeric price', 'POST', '/books', 400, { title: 'T', author: 'A', price: 'ten' });
  await call('F11 negative price', 'POST', '/books', 400, { title: 'T', author: 'A', price: -5 });
  await call('F12 broken JSON', 'POST', '/books', 400, undefined, '{ "title": ');
  await call('F13 empty title on PUT', 'PUT', '/books/1', 400, { title: '', author: 'A', price: 10 });
  await call('F14 PUT missing id', 'PUT', '/books/99999', 404, { title: 'T', author: 'A', price: 10 });
  await call('F15 DELETE missing id', 'DELETE', '/books/99999', 404);
  await call('F16 unknown route', 'GET', '/authors', 404);

  console.log(failed === 0 ? '\nAll checks passed' : `\n${failed} check(s) failed`);
  process.exit(failed === 0 ? 0 : 1);
};

run().catch((error) => {
  console.error(`Could not reach ${BASE}: ${error.message}. Is the server running?`);
  process.exit(1);
});
