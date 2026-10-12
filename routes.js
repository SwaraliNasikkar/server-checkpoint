const { validateRegistration } = require('./validators');
const store = require('./store');
const views = require('./views');

const html = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(body); };
const json = (res, status, obj) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };

function register(res, body, asJson) {
  const { valid, errors, values } = validateRegistration(body);
  if (!valid) return asJson ? json(res, 400, { ok: false, errors }) : html(res, 400, views.formPage(values, errors));
  if (store.emailExists(values.email)) {
    const e = { email: 'This email is already registered. Use a different one.' };
    return asJson ? json(res, 409, { ok: false, errors: e }) : html(res, 409, views.formPage(values, e));
  }
  const user = store.addUser(values);
  return asJson ? json(res, 201, { ok: true, message: 'Account created.', id: user.id }) : html(res, 201, views.successPage(user));
}

module.exports = {
  'GET /': (req, res) => html(res, 200, views.formPage()),
  'GET /users': (req, res) => {
    const q = (new URL(req.url, 'http://localhost').searchParams.get('q') || '').trim().toLowerCase();
    const all = store.listUsers();
    const list = q ? all.filter((u) => u.name.toLowerCase().includes(q) || u.email.includes(q)) : all;
    html(res, 200, views.usersPage(list, q, all));
  },
  'POST /register': (req, res, body) => register(res, body, false),
  'POST /users/delete': (req, res, body) => {
    store.removeUser(Number(body.id));
    res.writeHead(303, { Location: '/users' });
    res.end();
  },
  'POST /api/register': (req, res, body) => register(res, body, true),
  'GET /api/users': (req, res) => json(res, 200, store.listUsers()),
};