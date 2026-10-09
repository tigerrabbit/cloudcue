// Loopback-only server for the unmodified bundled UI, with the production CSP.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../ui');
const config = require('../src-tauri/tauri.conf.json');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
http.createServer((request, response) => {
  const name = new URL(request.url, 'http://127.0.0.1').pathname.slice(1) || 'index.html';
  if (!/^[a-z-]+\.(html|js|css|json)$/.test(name) || !fs.existsSync(path.join(root, name))) {
    response.writeHead(404); response.end(); return;
  }
  response.writeHead(200, { 'Content-Type': types[path.extname(name)], 'Content-Security-Policy': config.app.security.csp });
  fs.createReadStream(path.join(root, name)).pipe(response);
}).listen(4173, '127.0.0.1');
