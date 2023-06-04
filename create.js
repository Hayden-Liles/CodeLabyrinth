#!/usr/bin/env node
let slugify = require('slugify');
let inquirer = require("inquirer");
const { printAlert, clearScreen, colors, printWarning, printInfo, printSuccess } = require("./console-utils");

const { createMvcApp } = require('./lib/createMvcApp.js')
const { createNodeMVCApp } = require('./lib/createNodeMVCApp.js')
const { createVueApp } = require('./lib/createVueApp.js')
const { createVueFsApp } = require("./lib/createVueFsApp")

const templates = [
  "MVC",
  "MVC Node",
  "Vue",
  "Vue Node"
];
const CURR_DIR = process.cwd();

//prompts and the name of properties added to the answers object
const prompts = [
  {
    name: "project-choice",
    type: "list",
    message: "What project template would you like to generate?",
    choices: templates
  },
  {
    name: "project-name",
    type: "input",
    message: "Project name:",
    validate(input) {
      return /^([A-Za-z\-\_\d])+$/.test(input)
        ? true
        : "Project name may only include letters, numbers, underscores and dashes.";
    }
  }
];

async function create() {
  // @ts-ignore
  const answers = await inquirer.prompt(prompts)
  let projectChoice = answers["project-choice"];
  let projectName = answers["project-name"];
  let initialize = answers["initialize"];
  // @ts-ignore
  projectName = slugify(projectName);
  try {
    clearScreen();
    console.group(colors.FgMagenta, "---INITIALIZING PROJECT---");
    printInfo(`--------------------\n[+] CREATING PROJECT\n[+] ${projectName}`);
    let message = ''
    switch (projectChoice) {
      case 'MVC':
        message = await createMvcApp(CURR_DIR, projectName)
        break;
      case 'MVC Node':
        message = await createNodeMVCApp(CURR_DIR, projectName)
        break;
      case 'Vue':
        message = await createVueApp(CURR_DIR, projectName)
        break;
      case 'Vue Node':
        message = await createVueFsApp(CURR_DIR, projectName)
        break;

    }

    printSuccess("[+] Project Created Successfully");
    printWarning(message);
    console.groupEnd();
  } catch (e) {
    printAlert(`[!] ${e.message}`, e);
  }
}

async function start() {
  try {
    await create()
  } catch (e) {
    console.error(e)
  }
}

start()

