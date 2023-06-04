let fs = require("fs");
let { execSync } = require("child_process");
const { npm_i } = require("./npm_i");

function createVueApp(CURR_DIR, projectName) {
  return new Promise((resolve, reject) => {
    let projPath = `${CURR_DIR}/${projectName}`;
    try {
      execSync(`npx create-project ${projectName} Hayden-Liles/cl-Vue`);
      process.chdir(projPath);

      if (fs.existsSync("package.json")) {
        npm_i()
      }

      fs.writeFileSync(`${projPath}/.gitignore`, "node_modules \n.env", "utf8");
      npm_i()

      resolve(`[#] Open Project\n[#] cd into ${projectName}\n[#] type 'code .'`)
    } catch (e) {
      reject(e)
    }
  })
}

exports.createVueApp = createVueApp;
