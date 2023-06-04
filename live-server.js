#!/usr/bin/env node
const http = require("http");
const fs = require("fs");
const path = require("path");
const mime = require("mime");
const ws = require("ws");
const chokidar = require("chokidar");
const { colors } = require("./console-utils.js");

const ROOT = process.cwd();
let PORT = 8080;
let WS_PORT = 8081;

try {
  if (process.argv) {
    process.argv.find((a, i) => {
      if (a.includes("-p")) {
        PORT = Number(process.argv[i + 1]);
        return true;
      }
      if (a.includes("-wp")) {
        WS_PORT = Number(process.argv[i + 1]);
        return true;
      }
    });
  }
} catch (error) {
  console.error(error);
}


const assetsServer = http.createServer(async (request, response) => {
  // Special Case: Reject non-GET methods.
  if (request.method !== "GET") {
    const responseBody = `Forbidden Method: ${request.method}`;

    response.writeHead(403, {
      "Content-Type": "plain/text",
      "Content-Length": Buffer.byteLength(responseBody),
    });

    return response.end(responseBody);
  }

  // Special Case: GET '/client.js'
  if (request.url === "/client.js") {
    const responseBody = await fs.promises.readFile("./dev-server/client.js");

    response.writeHead(200, {
      "Content-Length": responseBody.length,
      "Content-Type": "application/javascript",
    });

    return response.end(responseBody);
  }

  // General Case: GET request for any resource

  // Parse the request URL to get the resource pathname.
  const url = new URL(request.url, `http://${request.headers.host}`);
  let pathname = url.pathname;

  // If the pathname ends with '/', append 'index.html'.
  if (pathname.endsWith("/")) {
    pathname += "index.html";
  }

  try {
    // Try to read the given resource into a Buffer.
    const resourcePath = path.join(ROOT, pathname);
    let responseBody = await fs.promises.readFile(resourcePath);

    // HTML Files: Inject a <script> tag before </body>
    if (resourcePath.endsWith(".html")) {
      // @ts-ignore
      responseBody = responseBody
        .toString()
        .replace("</body>", `<script>const socket = new WebSocket("ws://localhost:8081");
        socket.addEventListener("message", (event) => {
          if (event.data === "RELOAD") {
            window.location.reload();
          }
        });</script></body>`);

      responseBody = Buffer.from(responseBody);
    }

    response.writeHead(200, {
      "Content-Type": mime.getType(resourcePath),
      "Content-Length": responseBody.length,
    });

    return response.end(responseBody);
  } catch (e) {
    // Respond to all errors with a 404 response.
    const responseBody = `Cannot GET resource: ${pathname}`;

    response.writeHead(404, {
      "Content-Type": "plain/text",
      "Content-Length": Buffer.byteLength(responseBody),
    });

    return response.end(responseBody);
  }
});

assetsServer.listen(PORT, () => {
  console.log(`${colors.FgGreen}---CODE LABYRINTH LIVE SERVER-------------------------------------------------------${colors.Reset}
  Starting static file server${colors.FgYellow}${ROOT}${colors.Reset}
    Available on:  ${colors.FgCyan}http://localhost:${PORT}${colors.Reset}
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

const reloadServer = new ws.WebSocketServer({
  port: WS_PORT,
});

reloadServer.on("listening", () => {
  console.log(`WebSocket Server is running on port: ${WS_PORT}`);
});

reloadServer.on("reload", () => {
  reloadServer.clients.forEach((client) => {
    client.send("RELOAD");
  });
});

chokidar.watch(ROOT + "/**/*.*").on("all", () => {
  reloadServer.emit("reload");
});
