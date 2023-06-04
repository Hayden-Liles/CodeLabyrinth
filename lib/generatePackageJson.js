function generatePackageJson(projectName) {
  return `
  {
    "name": "${projectName.toLowerCase()}",
    "version": "1.0.0",
    "scripts": {
      "build": "npm run setup:server",
      "setup:app": "npm run setup:server && npm run setup:client",
      "setup:client": "cd ${projectName}.client && npm i",
      "setup:server": "cd ${projectName} && npm i",
      "start": "node ${projectName}/index.js"
    }
  }
  `;
}
exports.generatePackageJson = generatePackageJson;
