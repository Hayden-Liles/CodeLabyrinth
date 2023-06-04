let fs = require("fs");
let { execSync } = require("child_process");
const { npm_i } = require("./npm_i");

function createMvcApp(CURR_DIR, projectName) {
  return new Promise((resolve, reject) => {
    let projPath = `${CURR_DIR}/${projectName}`;
    try {
      execSync(`npx create-project ${projectName} Hayden-Liles/cl-MVC`);
      process.chdir(projPath);
      if (fs.existsSync("package.json")) {
        npm_i()
      }

      fs.writeFileSync(`${projPath}/.gitignore`, "node_modules", "utf8");
      npm_i()
      // TO CREATE THE .env File
      // fs.writeFileSync(`${projPath}/.gitignore`, "node_modules \n.env", "utf8");
      // let envContents = ["NODE_ENV=dev", "CONNECTION_STRING=", "PORT="];
      // fs.writeFileSync(`${projPath}/.env`, envContents.join("\n"), "utf8");
      // npm_i()

      resolve(`[#] Open Project\n[#] cd into ${projectName}\n[#] type 'code .'`)
    } catch (e) {
      reject(e)
    }
  })
}

exports.createMvcApp = createMvcApp;
