'use strict'

const BaseProjectTask = require('./BaseProjectTask')

class ProjectPublisher extends BaseProjectTask {
  constructor(options) {
    super(options)
    const opts = Object.assign({}, options)
    this.registry = opts.registry || null
    this.link = opts.link === undefined ? false : opts.link
  }

  buildCommand(projectPath, dependencies) { // eslint-disable-line
    let commands = [`cd ${projectPath}`, 'rm -rf node_modules']
    commands.push('npm --loglevel warn install')
    commands.push(`npm --loglevel warn publish ${this.registry ? '--registry=' + this.registry : ''} .`)
    return commands.join(' && ')
  }

}

module.exports = ProjectPublisher
