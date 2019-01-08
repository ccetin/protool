'use strict'

const BaseProjectShellTask = require('./BaseProjectShellTask')

class ProjectPublisher extends BaseProjectShellTask {
  constructor(options) {
    super(options)
    const opts = Object.assign({}, options)
    this.registry = opts.registry || null
  }

  get taskName() {
    return 'Publisher'
  }

  buildCommand(projectPath, dependencies) { // eslint-disable-line
    const commands = [`cd ${projectPath}`, 'rm -rf node_modules']
    commands.push('npm --loglevel warn install')
    commands.push(`npm --loglevel warn publish ${this.registry ? '--registry=' + this.registry : ''} .`)
    return commands.join(' && ')
  }

}

module.exports = ProjectPublisher
