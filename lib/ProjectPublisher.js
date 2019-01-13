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
    if (projectPath) {
      const commands = [`cd ${projectPath}`]
      const registry = this.registry ? '--registry=' + this.registry : ''
      const scope = this.account ? '--scope=' + this.account : ''
      commands.push('npm --loglevel warn install')
      commands.push(`npm --loglevel warn publish ${registry} ${scope} .`)
      return commands.join(' && ')
    }
    return ''
  }

}

module.exports = ProjectPublisher
