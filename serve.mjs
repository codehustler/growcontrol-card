// Tiny CORS-enabled static server for the card bundle, so HA can load it as a
// Lovelace resource from this PC over the LAN (no write access to /config/www).
// Cross-origin module scripts require CORS headers, hence Access-Control-Allow-Origin.
import http from 'node:http';
import { readFile } from 'node:fs/promises';

const FILE = new URL('./dist/growcontrol-card.js', import.meta.url);
const PORT = 8099;

http.createServer(async (req, res) => {
  try {
    const buf = await readFile(FILE);
    res.writeHead(200, {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    });
    res.end(buf);
  } catch (e) {
    res.writeHead(500);
    res.end(String(e));
  }
}).listen(PORT, '0.0.0.0', () => console.log('growcontrol bundle served on 0.0.0.0:' + PORT));
