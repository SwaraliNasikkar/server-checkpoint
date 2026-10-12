const crypto = require('crypto');
let users = [];
let nextId = 1;

function hash(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(pw, salt, 32).toString('hex');
}
const emailExists = (e) => users.some((u) => u.email === e);
function addUser({ name, email, age, phone, password }) {
  const user = { id: nextId++, name, email, age: +age, phone, passwordHash: hash(password), createdAt: new Date() };
  users.push(user);
  return user;
}
const listUsers = () => users.map(({ passwordHash, ...safe }) => safe);
const removeUser = (id) => { const n = users.length; users = users.filter((u) => u.id !== id); return users.length < n; };
const reset = () => { users = []; nextId = 1; };

module.exports = { emailExists, addUser, listUsers, removeUser, reset };