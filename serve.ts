// A tiny static server for game/ (Node 22, standard library only), so the
// entry can be played locally without a build step: `node serve.ts` serves
// game/ on http://localhost:8080. It sends the MIME types a browser game
// needs (including the painted JPEG art under game/assets/), refuses any
// path outside game/, and otherwise does nothing clever: this is a
// development convenience, not a web server for the internet.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const requested = portIndex === -1 ? 8080 : Number(args[portIndex + 1]);
const port = Number.isInteger(requested) && requested > 0 && requested < 65536 ? requested : 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.txt': 'text/plain; charset=utf-8',
};

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400);
    response.end('bad path');
    return;
  }
  // Strip any leading ../ segments before joining, then verify the
  // resolved file is still inside game/ — never serve outside it.
  const file = resolve(join(root, normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '')));
  if (file !== root && !file.startsWith(root + sep)) {
    response.writeHead(403);
    response.end('outside game/');
    return;
  }
  let target = file;
  try {
    const st = statSync(target);
    if (st.isDirectory()) target = join(target, 'index.html');
  } catch {
    response.writeHead(404);
    response.end('not found');
    return;
  }
  try {
    const st = statSync(target);
    if (!st.isFile()) throw new Error('not a file');
    response.writeHead(200, {
      'content-type': MIME[extname(target)] ?? 'application/octet-stream',
      'content-length': st.size,
    });
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404);
    response.end('not found');
  }
}).listen(port, () => {
  console.log(`Turkey Run serving game/ at http://localhost:${port}`);
});
