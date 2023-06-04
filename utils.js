const { colors, printSuccess, printAlert, printWarning, printInfo } = require("./console-utils");
let { execSync } = require("child_process");
const https = require('https')
const inquirer = require("inquirer");

const fs = require('fs');
const path = require("path");
const CURR_DIR = process.cwd();

const configFile = path.join(CURR_DIR, "_cw_git_config.json");
let GIT_USER = null

const prompts = [
  {
    name: "name",
    type: "input",
    message: "What is your name? >"
  },
  {
    name: "ghname",
    type: "input",
    message: "What is your github username? >"
  },
  {
    name: "ghemail",
    type: "input",
    message: "What is your github email? >"
  }
];


function getGitUser() {
  if (GIT_USER) {
    printInfo("  [~] Git user found");
    return GIT_USER
  }
  if (fs.existsSync(configFile)) {
    printInfo("  [~] Git user found");
    const info = fs.readFileSync(configFile, 'utf8')
    GIT_USER = JSON.parse(info)
    return GIT_USER
  }
  printWarning("  [~] Git user not found");
}


async function setupGit() {
  try {
    let gitUser = getGitUser();
    if (gitUser) {
      printWarning("  [~] Git already configured");
      // @ts-ignore
      const q = await inquirer.prompt([{
        name: "reconfigure",
        type: "confirm",
        message: "Do you want to reconfigure your settings? y/N: "
      }])
      if (!q.reconfigure) {
        return gitUser
      }
    }

    // @ts-ignore
    const answers = await inquirer.prompt(prompts)
    const { name, ghname, ghemail } = answers
    let ghaccount = await getGithubUser(ghname)
    ghaccount.fullname = name
    ghaccount.ghname = ghname
    ghaccount.ghemail = ghemail
    configureGit(name, ghemail)
    fs.writeFileSync(configFile, JSON.stringify(ghaccount, null, 2), 'utf8')
    GIT_USER = ghaccount
    return ghaccount
  } catch (err) {
    console.error('[!] Error setting up git', err);
  }
}

function configureGit(name, ghemail) {
  console.groupCollapsed(colors.FgMagenta, "  [~] Configuring git", colors.Reset);
  execSync(`git config --global user.name "${name}"`);
  execSync(`git config --global user.email "${ghemail}"`);
  execSync(`git config --global core.autocrlf true`);
}

function getGithubUser(username) {
  console.group(colors.FgMagenta, "---VALIDATING GITHUB ACCOUNT---");
  return new Promise((resolve, reject) => {
    https.get(`https://api.github.com/users/${username}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let ghAccount = JSON.parse(data);
        if (!ghAccount) {
          throw new Error("Error getting github user")
        }
        if (ghAccount.login) {
          printSuccess(`[+] Github Account Found: [${ghAccount.type} | ${ghAccount.login}]`)
          resolve(ghAccount);
        } else {
          reject(ghAccount);
        }
      });
    }).on('error', (e) => {
      reject(e);
    })
  })
}

async function getOrSetGitUser() {
  let gitUser = await getGitUser()
  if (!gitUser) {
    gitUser = await setupGit()
  }
  return gitUser
}

async function verifyGithubRepo(username, projectName) {

  printInfo("  [~] Verifying github repository");
  return new Promise((resolve, reject) => {
    https.get(`https://api.github.com/repos/${username}/${projectName}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let ghAccount = JSON.parse(data);
        if (!ghAccount) {
          reject(ghAccount);
        }
        if (ghAccount.name) {
          printSuccess(`[+] Github Repo Found: [${ghAccount.name}]`)
          resolve(ghAccount);
        } else {
          reject(ghAccount);
        }
      });
    }).on('error', (e) => {
      reject(e);
    })
  })

}

async function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function verifyGitRemote(gitUser, projectName, attempt = 0) {
  let verified = false
  try {
    await verifyGithubRepo(gitUser.ghname, projectName)
    verified = true
  } catch (e) {
    printAlert("  [~] Error verifying github repository")
    if (attempt > 3) {
      printAlert("[!] Unable to create or verify remote repository");
      return
    }
    if (attempt === 0) {
      await createRepoPrompt(projectName);
    } else {
      printWarning(`  [~] Attempt: ${attempt}`)
      await sleep(3000)
    }
  }
  if (!verified) {
    return await verifyGitRemote(gitUser, projectName, attempt + 1)
  }
  printSuccess("[+] Git remote verified");

}


async function createRepoPrompt(projectName) {
  try {
    printAlert(`[-] Please create a repository named [${projectName}]`);
    await sleep(1500);
    execSync('start https://github.com/new');
    // @ts-ignore
    const q = await inquirer.prompt([{
      name: 'created',
      type: 'confirm',
      message: 'Did you create the repo ' + projectName + ' Y/n?'
    }]);
    if (!q.created) {
      throw new Error("Repo not created")
    }
  } catch (e) {
    printAlert("[!] Unable to create or verify remote repository");
  }
}

async function initializeProject(projectName) {
  try {
    let gitUser = await getOrSetGitUser();
    if (!CURR_DIR.endsWith(projectName)) {
      process.chdir(path.join(CURR_DIR, projectName));
    }
    execSync('git init');
    execSync('git add .');
    execSync(`git remote add origin https://github.com/${gitUser.ghname}/${projectName}.git`);
    execSync('git commit -m "project initialized"');
    execSync('git branch -M main');
    await verifyGitRemote(gitUser, projectName)
    execSync('git push -f -u origin main');
  } catch (e) {
    printAlert(e, `[-] Error pushing to github. Please create a repository named [${projectName}] then run the following command`);
    printWarning(`git push -f -u origin main`);
  }
}


module.exports.getOrSetGitUser = getOrSetGitUser;
module.exports.getGitUser = getGitUser;
module.exports.setupGit = setupGit;
module.exports.initializeProject = initializeProject;
