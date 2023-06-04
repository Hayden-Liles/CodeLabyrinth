#!/usr/bin/env node
const http = require('http');
const fs = require('fs').promises;
const mime = require('mime');
const path = require('path');
const { colors } = require('./console-utils');

const basePath = process.cwd();
let port = 8080;

if (process.argv.includes('-p')) {
  const portIndex = process.argv.indexOf('-p') + 1;
  if (portIndex < process.argv.length) {
    const portArg = Number(process.argv[portIndex]);
    if (!Number.isNaN(portArg)) {
      port = portArg;
    } else {
      console.error('Invalid port number');
      process.exit(1);
    }
  }
}

http.createServer(async (req, res) => {
  if (req.method !== 'GET') {
    const responseBody = `Method Not Allowed: ${req.method}`;
    res.writeHead(405, {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(responseBody),
      'Allow': 'GET',
    });
    return res.end(responseBody);
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = url.pathname;
  if (pathname.endsWith('/')) pathname += 'index.html';

  try {
    const resourcePath = path.join(basePath, pathname);
    const responseBody = await fs.readFile(resourcePath);
    res.writeHead(200, {
      'Content-Type': mime.getType(resourcePath) || 'application/octet-stream',
      'Content-Length': responseBody.length,
    });
    return res.end(responseBody);
  } catch (e) {
    const responseBody = `Not Found: ${pathname}`;
    res.writeHead(404, {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(responseBody),
    });
    return res.end(responseBody);
  }
}).listen(port, () => {
  console.log(`${colors.FgGreen}---CODE LABYRINTH SERVER-------------------------------------------------------${colors.Reset}
Starting static file server ${colors.FgYellow}${basePath}${colors.Reset}
  Available on:  ${colors.FgCyan}http://localhost:${port}${colors.Reset}
  Quit: ${colors.FgMagenta}ctrl+c${colors.Reset}
`);

  process.on('SIGINT', function () {
    console.log(colors.FgRed, '  [!] Server stopped.', colors.Reset);
    process.exit();
  });

  process.on('SIGTERM', function () {
    console.log(colors.FgRed, '  [!] Server stopped.', colors.Reset);
    process.exit();
  });
});
