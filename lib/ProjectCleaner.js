'use strict'

const path = require('path')
const BaseProjectShellTask = require('./BaseProjectShellTask')

class ProjectCleaner extends BaseProjectShellTask {
  constructor(options) {
    super(options)
  }

  get taskName() {
    return 'Cleaner'
  }

  buildCommand(projectPath) {
    if (projectPath) {
      const name = path.basename(projectPath)
      if (name) {
        const commands = [`cd ${projectPath}`, 'rm -rf node_modules', 'rm -rf package-lock.json']
        if (this.account) {
          commands.push(`[ -L "$( npm config get prefix )/lib/node_modules/${this.account}/${name}" ]`)
          commands.push(`rm "$( npm config get prefix )/lib/node_modules/${this.account}/${name}"`)
        } else {
          commands.push(`[ -L "$( npm config get prefix )/lib/node_modules/${name}" ]`)
          commands.push(`rm "$( npm config get prefix )/lib/node_modules/${name}"`)
        }
        return commands.join(' && ')
      }
    }
    return ''
  }

}

module.exports = ProjectCleaner
