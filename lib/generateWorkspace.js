function generateWorkspace(projectName) {
  return `
{
  "folders": [
    {
      "path": "${projectName}.client",
      "name": "client"
    },
    {
      "path": "${projectName}",
      "name": "server"
    }
  ],
  "settings": {
    "editor.suggestSelection": "first",
    "git.enableSmartCommit": true,
    "git.confirmSync": false,
    "git.autofetch": true,
    "javascript.referencesCodeLens.enabled": true,
    "javascript.referencesCodeLens.showOnAllFunctions": true,
    "typescript.implementationsCodeLens.enabled": true,
    "typescript.referencesCodeLens.enabled": true,
    "typescript.referencesCodeLens.showOnAllFunctions": true,
    "js/ts.implicitProjectConfig.checkJs": true,
    "files.exclude": {
      "**/.nyc_*": true,
      "**/coverage": true,
      "**/node_modules": true
    },
    "javascript.updateImportsOnFileMove.enabled": "always",
    "explorer.confirmDragAndDrop": false,
    "eslint.alwaysShowStatus": true,
    "eslint.format.enable": true,
    "eslint.lintTask.enable": true,
    "eslint.codeActionsOnSave.mode": "all",
    "editor.codeActionsOnSave": {
      "source.fixAll": true
    }
  }
}`;
}
exports.generateWorkspace = generateWorkspace;