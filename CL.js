#!/usr/bin/env node
const yargs = require("yargs");
const { colors, printBanner, clearScreen } = require("./console-utils");

function printHelp() {
  printBanner();
  console.log(`
  Tools:
    [-] ${colors.FgGreen}test-create:${colors.Reset} creates a new project from templates
    [-] ${colors.FgGreen}test-add:${colors.Reset} selectively add packages to your existing project
    [-] ${colors.FgGreen}test-serve (-p || --port):${colors.Reset} initailizes the static server with optional specification for the port to serve on`);
}

function start(){
  try {
    clearScreen();
    printBanner();
    const commands = require("yargs")
    commands.usage("CL [command] [options]")

      .command("create", "creates a new project from templates", yargs => {
        require('./create');
      })
      .command("serve", "initializes the static server with optional specification for the port to serve on", yargs => {
        require('./serve-static');
      })
      .command("live", "initializes a live static server with optional specification for the port and socket to serve on", yargs => {
        require('./live-server');
      })
      .command("help", 'Prints the help menu', yargs => {
        printHelp();
      })
      .alias("h", "help")
      .alias("v", "version")
      .alias("server", "live")
      .alias("dev", "live")
      .alias("host", "live")
      .demandCommand(1, "You must specify a command")
      .version()
      .argv;
  } catch (error) {
    console.error(error);
  }
}

start()
