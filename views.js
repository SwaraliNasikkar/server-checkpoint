const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const SCRIPT = String.raw`
const $ = (id) => document.getElementById(id);
const rules = {
  name: (v) => /^[A-Za-z][A-Za-z .'-]{1,49}$/.test(v.name.trim()),
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim()),
  age: (v) => /^\d+$/.test(v.age.trim()) && +v.age >= 18 && +v.age <= 120,
  phone: (v) => /^[6-9]\d{9}$/.test(v.phone.replace(/[\s-]/g, '')),
  len: (v) => v.password.length >= 8,
  mix: (v) => /[A-Z]/.test(v.password) && /[a-z]/.test(v.password) && /\d/.test(v.password),
  match: (v) => v.password !== '' && v.password === v.confirm,
};
function run() {
  const v = {};
  ['name', 'email', 'age', 'phone', 'password', 'confirm'].forEach((k) => (v[k] = $(k).value));
  let done = 0;
  document.querySelectorAll('[data-rule]').forEach((li) => {
    const ok = rules[li.dataset.rule](v);
    li.classList.toggle('ok', ok);
    if (ok) done++;
  });
  $('progress').style.width = (done / 7) * 100 + '%';
  $('count').textContent = done + ' of 7 rules met';
  const p = v.password;
  const score = (p.length >= 8) + (/[A-Z]/.test(p) && /[a-z]/.test(p)) + /\d/.test(p) + /[^A-Za-z0-9]/.test(p) + (p.length >= 12);
  const bar = $('meter');
  bar.style.width = (p ? Math.max(score, 1) * 20 : 0) + '%';
  bar.dataset.s = score;
  $('meter-label').textContent = p ? ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][score] : '';
}
document.querySelector('form').addEventListener('input', run);
document.querySelectorAll('.eye').forEach((b) => b.addEventListener('click', () => {
  const i = $(b.dataset.for);
  i.type = i.type === 'password' ? 'text' : 'password';
  b.textContent = i.type === 'password' ? 'Show' : 'Hide';
}));
run();`;

const layout = (title, body, active = '') => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css"></head>
<body><header><a href="/" class="brand"><span class="logo">✓</span>Checkpoint</a>
<nav><a href="/" class="${active === 'form' ? 'on' : ''}">Register</a><a href="/users" class="${active === 'users' ? 'on' : ''}">Users</a></nav></header>
<main>${body}</main></body></html>`;

function field(id, label, type, values, errors, hint = '', ph = '') {
  const err = errors[id];
  const val = type === 'password' ? '' : values[id] ?? '';
  const input = `<input id="${id}" name="${id}" type="${type}" placeholder="${esc(ph)}" value="${esc(val)}" autocomplete="off" aria-invalid="${err ? 'true' : 'false'}"${err ? ` aria-describedby="${id}-err"` : ''}>`;
  const wrapped = type === 'password' ? `<div class="pw">${input}<button type="button" class="eye" data-for="${id}">Show</button></div>` : input;
  return `<div class="field${err ? ' has-error' : ''}"><label for="${id}">${label}</label>${wrapped}
${hint && !err ? `<small>${hint}</small>` : ''}${err ? `<p class="error" id="${id}-err">⚠ ${esc(err)}</p>` : ''}</div>`;
}

function formPage(values = {}, errors = {}) {
  const n = Object.keys(errors).length;
  const banner = n ? `<div class="banner bad" role="alert"><b>Not submitted.</b> The server rejected ${n} ${n === 1 ? 'field' : 'fields'}. Fix them and try again.</div>` : '';
  const rule = (k, t) => `<li data-rule="${k}">${t}</li>`;
  return layout('Register', `<div class="split">
<aside class="rules"><h2>What the server checks</h2><p>Every rule is enforced again on the server, even if your browser says it's fine.</p>
<div class="track"><div id="progress"></div></div><p id="count" class="count"></p>
<ul>${rule('name', 'Name: 2–50 letters')}${rule('email', 'Valid email address')}${rule('age', 'Age between 18 and 120')}${rule('phone', 'Mobile: 10 digits, starts 6–9')}${rule('len', 'Password: 8+ characters')}${rule('mix', 'Upper, lower and a digit')}${rule('match', 'Passwords match')}</ul></aside>
<section class="card"><h1>Create your account</h1>${banner}
<form method="POST" action="/register" novalidate>
${field('name', 'Full name', 'text', values, errors, '', 'Asha Patil')}
${field('email', 'Email', 'text', values, errors, '', 'asha@example.com')}
<div class="row">${field('age', 'Age', 'text', values, errors, '', '22')}${field('phone', 'Mobile', 'text', values, errors, '', '9876543210')}</div>
${field('password', 'Password', 'password', values, errors)}
<div class="strength"><div class="track"><div id="meter" data-s="0"></div></div><span id="meter-label"></span></div>
${field('confirm', 'Confirm password', 'password', values, errors)}
<button type="submit" class="btn">Create account</button></form></section></div><script>${SCRIPT}</script>`, 'form');
}

const successPage = (u) => layout('Account created', `<section class="card center">
<svg class="tick" viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M14 27l8 8 16-17"/></svg>
<h1>You're in, ${esc(u.name.split(' ')[0])}</h1>
<div class="banner good" role="status">Account created. Every field passed server-side validation.</div>
<dl><dt>Email</dt><dd>${esc(u.email)}</dd><dt>Age</dt><dd>${esc(u.age)}</dd><dt>Mobile</dt><dd>${esc(u.phone)}</dd></dl>
<a class="btn" href="/users">View all users</a></section>`);

const hues = [255, 170, 330, 25, 200, 95];
function usersPage(users, q = '', all = users) {
  const avg = all.length ? Math.round(all.reduce((s, u) => s + u.age, 0) / all.length) : '–';
  const rows = users.map((u) => `<li class="user"><span class="avatar" style="--h:${hues[u.id % hues.length]}">${esc(u.name[0].toUpperCase())}</span>
<div><b>${esc(u.name)}</b><span>${esc(u.email)} · ${esc(u.phone)} · age ${u.age}</span></div>
<form method="POST" action="/users/delete" onsubmit="return confirm('Delete ${esc(u.name).replace(/'/g, '')}?')"><input type="hidden" name="id" value="${u.id}"><button class="del">Delete</button></form></li>`).join('');
  const empty = all.length ? `<p class="empty">No users match "${esc(q)}".</p>` : '<p class="empty">No one has registered yet. <a href="/">Create the first account.</a></p>';
  return layout('Users', `<h1 class="wide">Registered users</h1>
<div class="stats"><div><b>${all.length}</b>users</div><div><b>${avg}</b>average age</div></div>
<form class="search" method="GET" action="/users"><input name="q" value="${esc(q)}" placeholder="Search by name or email"><button class="btn">Search</button></form>
<ul class="users">${rows || empty}</ul>`, 'users');
}

const messagePage = (code, text) => layout(String(code), `<section class="card center"><h1>${code}</h1><p>${esc(text)}</p><a class="btn" href="/">Back to the form</a></section>`);

module.exports = { formPage, successPage, usersPage, messagePage };