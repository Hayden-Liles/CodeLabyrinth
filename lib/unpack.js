const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const { uniques } = require('./unique')

exports.unpack = function(CURR_DIR, localPackage, templatePackage){
  const configName = path.join(CURR_DIR, templatePackage.name+'.config.json')
  try {
    const exists = fs.existsSync(configName)
    if(exists){
      console.log('\x1b[33m[⚠ ALERT] project already unpacked\x1b[0m')
      return
    }
  } catch (error) {
    return console.log('[!] ERROR unpacking', error)
  }
  const config = {
    scripts: uniques(localPackage, templatePackage, 'scripts'),
    dependencies: uniques(localPackage, templatePackage, 'dependencies'),
    devDependencies: uniques(localPackage, templatePackage, 'devDependencies')
  }
  const combined = {...localPackage}
  combined.scripts = {
    ...(combined.scripts || {}),
    ...config.scripts
  }
  combined.dependencies = {
    ...(combined.dependencies || {}),
    ...config.dependencies
  }
  combined.devDependencies = {
    ...(combined.devDependencies || {}),
    ...config.devDependencies
  }

  fs.writeFileSync(configName, JSON.stringify(config, null, 2), 'utf8')
  fs.writeFileSync(path.join(CURR_DIR, 'package.json'), JSON.stringify(combined, null, 2), 'utf8')
  fs.unlinkSync(path.join(CURR_DIR, '.package-template/src/package.json'))
  mergeAndRemove(CURR_DIR, '.gitignore')
}


function mergeAndRemove(CURR_DIR, src, destination){
  destination = destination || path.join(CURR_DIR, src)
  const srcPath = path.join(CURR_DIR, '.package-template/src', src)
  if(fs.existsSync(srcPath)){
      const data = fs.readFileSync(
        srcPath,
        {encoding:'utf-8'}
      )
      fs.appendFileSync(destination, data)
      fs.unlinkSync(srcPath)
    }
}
