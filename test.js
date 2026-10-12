// test.js - run with: npm test   (valid + invalid inputs, GET/POST, status codes)
const test = require('node:test');
const assert = require('node:assert');
const server = require('./server');
const store = require('./store');

let base;
test.before(() => new Promise((r) => server.listen(0, () => { base = `http://localhost:${server.address().port}`; r(); })));
test.after(() => server.close());
test.beforeEach(() => store.reset());

const good = { name: 'Asha Patil', email: 'asha@example.com', age: '22', phone: '9876543210', password: 'Passw0rdX', confirm: 'Passw0rdX' };
const post = (data, path = '/register') => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data) });

test('GET / shows the form', async () => {
  const r = await fetch(base + '/'); assert.strictEqual(r.status, 200);
  assert.match(await r.text(), /<form method="POST"/);
});
test('valid input -> 201 success message', async () => {
  const r = await post(good); assert.strictEqual(r.status, 201);
  assert.match(await r.text(), /Account created for Asha Patil/);
});
const bad = [
  ['empty name', { name: '' }, /Enter your full name/],
  ['digits in name', { name: 'R2D2' }, /Name must be 2-50/],
  ['bad email', { email: 'not-an-email' }, /valid email/],
  ['age under 18', { age: '17' }, /between 18 and 120/],
  ['age not numeric', { age: 'abc' }, /whole number/],
  ['short phone', { phone: '12345' }, /10 digits/],
  ['phone starts with 5', { phone: '5876543210' }, /start with 6, 7, 8 or 9/],
  ['weak password', { password: 'password', confirm: 'password' }, /uppercase letter/],
  ['mismatch', { confirm: 'Different1' }, /do not match/],
];
for (const [label, patch, re] of bad)
  test(`invalid: ${label} -> 400 + error`, async () => {
    const r = await post({ ...good, ...patch }); assert.strictEqual(r.status, 400);
    assert.match(await r.text(), re);
    assert.strictEqual(store.listUsers().length, 0);
  });
test('duplicate email -> 409', async () => {
  await post(good); const r = await post(good); assert.strictEqual(r.status, 409);
  assert.match(await r.text(), /already registered/);
});
test('XSS in name is rejected / escaped', async () => {
  const r = await post({ ...good, name: '<script>alert(1)</script>' });
  const t = await r.text(); assert.strictEqual(r.status, 400); assert.ok(!t.includes('<script>alert'));
});
test('JSON API returns field errors', async () => {
  const r = await fetch(base + '/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
  const j = await r.json(); assert.strictEqual(r.status, 400); assert.ok(j.errors.email && j.errors.password);
});
test('wrong method -> 405, unknown path -> 404', async () => {
  assert.strictEqual((await fetch(base + '/register')).status, 405);
  assert.strictEqual((await fetch(base + '/nope')).status, 404);
});