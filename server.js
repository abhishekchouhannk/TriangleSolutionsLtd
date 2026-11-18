// Tiny dependency-free static server for local preview: `npm start` then open http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'public');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8'
};

function send(res, code, file) {
  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  res.writeHead(code, { 'Content-Type': type });
  fs.createReadStream(file).pipe(res);
}

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  let file = path.normalize(path.join(ROOT, urlPath));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }

  const tryFiles = [file, file + '.html'];            // clean URLs: /about -> about.html
  const hit = tryFiles.find(f => fs.existsSync(f) && fs.statSync(f).isFile());
  if (hit) return send(res, 200, hit);
  send(res, 404, path.join(ROOT, '404.html'));
}).listen(PORT, () => console.log(`Triangle Electric site running at http://localhost:${PORT}`));
