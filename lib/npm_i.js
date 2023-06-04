let { execSync } = require("child_process");
let { colors, startSpinner, stopSpinner } = require('../console-utils');

function npm_i() {
  console.groupCollapsed(colors.FgMagenta, "  [~] Installing Dependencies", colors.Reset);
    startSpinner();
    execSync('npm i');
    stopSpinner();
  console.groupEnd();
}

exports.npm_i = npm_i
