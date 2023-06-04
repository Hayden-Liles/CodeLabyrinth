let fs = require("fs");
let { execSync } = require("child_process");
const { npm_i } = require("./npm_i");

function createNodeMVCApp(CURR_DIR, projectName) {
  return new Promise((resolve, reject) => {
    let projPath = `${CURR_DIR}/${projectName}`;
    try {
      execSync(`npx create-project ${projectName} Hayden-Liles/cl-NodeMVC`);
      process.chdir(projPath);
      if (fs.existsSync("package.json")) {
        npm_i()
      }

      fs.writeFileSync(`${projPath}/.gitignore`, "node_modules", "utf8");
      let envContents = ["NODE_ENV=dev", "CONNECTION_STRING=", "PORT=", "retryWrites=true&w=majority", "AUTH_DOMAIN=", "AUTH_AUDIENCE=", "AUTH_CLIENT_ID="];
      fs.writeFileSync(`${projPath}/.env`, envContents.join("\n"), "utf8");
      npm_i()

      resolve(`[#] Open Project\n[#] cd into ${projectName}\n[#] type 'code .'`)
    } catch (e) {
      reject(e)
    }
  })
}

exports.createNodeMVCApp = createNodeMVCApp;
