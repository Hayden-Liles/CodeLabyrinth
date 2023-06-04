let fs = require("fs");
let { execSync } = require("child_process");
const { generateWorkspace } = require("./generateWorkspace")
const { generatePackageJson } = require("./generatePackageJson")
let { colors, startSpinner, stopSpinner } = require('../console-utils');

function createVueFsApp(CURR_DIR, projectName) {
  return new Promise((resolve, reject) => {
    let projPath = `${CURR_DIR}/${projectName}`;
    try {
      
      console.group()
      let projPath = `${CURR_DIR}/${projectName}`;
      fs.mkdirSync(projPath);
      process.chdir(projPath);
      execSync(`npx create-project ${projectName}.client Hayden-Liles/cl-Vue`);
      execSync(`npx create-project ${projectName} Hayden-Liles/cl-NodeTemplate`);
      let envContents = ["NODE_ENV=dev", "CONNECTION_STRING=", "PORT=", "AUTH_DOMAIN=", "AUTH_AUDIENCE=", "AUTH_CLIENT_ID="];
      fs.writeFileSync(`${projectName}/.env`, envContents.join("\n"), "utf8");
      fs.writeFileSync(`${projPath}/${projectName}.code-workspace`, generateWorkspace(projectName), "utf8");
      fs.writeFileSync(`${projPath}/package.json`, generatePackageJson(projectName), "utf8");
      console.groupCollapsed(colors.FgMagenta, "  [~] Installing Dependencies", colors.Reset);
      startSpinner();
      execSync('npm run setup:app')
      stopSpinner();
      console.groupEnd();
      resolve(`
        [#] Open Project Workspace
        [#] cd into ${projectName}
        [#] type 'code ${projectName}.code-workspace'`)
      console.groupEnd();

    } catch (e) {
      reject(e)
    }
  })
}

exports.createVueFsApp = createVueFsApp;
