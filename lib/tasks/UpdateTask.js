'use strict'

const ShellTask = require('./ShellTask')

class UpdateTask extends ShellTask {
  constructor(...args) {
    super(...args)
    this.verbose = true
  }

  buildCommand({ directory, dependencies, npmLogLevel }) {
    if (directory) {
      const { otherDependencies } = dependencies
      const commands = [
        `cd ${directory}`,
        `npm --loglevel ${npmLogLevel} update ${otherDependencies.join(' ')}`
      ]
      return commands.join(' && ')
    }
    return ''
  }

}

module.exports = UpdateTask
