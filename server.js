// server.js - core http server: static files, body parsing, routing, error handling.
const http = require('http');
const fs = require('fs');
const path = require('path');
const routes = require('./routes');
const views = require('./views');

const PORT = process.env.PORT || 3000;
const MAX_BODY = 10 * 1024; // 10 KB

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > MAX_BODY) { reject(Object.assign(new Error('Too large'), { status: 413 })); req.destroy(); }
    });
    req.on('end', () => {
      try {
        const type = req.headers['content-type'] || '';
        if (type.includes('application/json')) return resolve(JSON.parse(data || '{}'));
        resolve(Object.fromEntries(new URLSearchParams(data)));
      } catch { reject(Object.assign(new Error('Bad JSON'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

const send = (res, status, text) => { res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(views.messagePage(status, text)); };

const server = http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    const key = `${req.method} ${pathname}`;

    if (req.method === 'GET' && pathname === '/style.css') {
      res.writeHead(200, { 'Content-Type': 'text/css' });
      return fs.createReadStream(path.join(__dirname, 'public', 'style.css')).pipe(res);
    }
    if (routes[key]) {
      const body = req.method === 'POST' ? await readBody(req) : undefined;
      return routes[key](req, res, body);
    }
    const pathExists = Object.keys(routes).some((k) => k.split(' ')[1] === pathname);
    if (pathExists) { res.setHeader('Allow', Object.keys(routes).filter((k) => k.endsWith(' ' + pathname)).map((k) => k.split(' ')[0]).join(', ')); return send(res, 405, 'That method is not allowed on this page.'); }
    send(res, 404, 'Page not found.');
  } catch (err) {
    if (err.status) return send(res, err.status, err.status === 413 ? 'Request too large.' : 'Malformed request body.');
    console.error(err);
    send(res, 500, 'Something went wrong on our side.');
  }
});

if (require.main === module) server.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
module.exports = server;