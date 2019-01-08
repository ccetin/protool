'use strict'

const path = require('path')
const BaseProjectShellTask = require('./BaseProjectShellTask')

class ProjectBuilder extends BaseProjectShellTask {
  constructor(options) {
    super(options)
  }

  get taskName() {
    return 'Cleaner'
  }

  buildCommand(projectPath) {
    const name = path.basename(projectPath)
    const commands = [`cd ${projectPath}`, 'rm -rf node_modules']
    if (projectPath && name && this.account) {
      commands.push(`rm "$( npm config get prefix )/lib/node_modules/${this.account}/${name}"`)
    }
    return commands.join(' && ')
  }

}

module.exports = ProjectBuilder
