'use strict'

const ShellTask = require('./ShellTask')

class PublishTask extends ShellTask {
  constructor(...args) {
    super(...args)
    this.verbose = true
  }

  buildCommand({ directory, scope, npmLogLevel }) {
    if (directory) {
      const registryUrl = this.getOption('registry')
      const commands = [`cd ${directory}`]
      const registry = registryUrl ? '--registry=' + registryUrl : ''
      const scopeLabel = scope ? '--scope=@' + scope : ''
      commands.push(`npm --loglevel ${npmLogLevel} install`)
      commands.push(`npm --loglevel ${npmLogLevel} publish ${registry} ${scopeLabel} .`)
      return commands.join(' && ')
    }
    return ''
  }

}

module.exports = PublishTask
