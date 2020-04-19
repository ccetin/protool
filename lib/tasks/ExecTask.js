'use strict'

const ShellTask = require('./ShellTask')

class ExecTask extends ShellTask {
  constructor(...args) {
    super(...args)
    this.verbose = true
  }

  buildCommand({ directory }) {
    if (directory) {
      const { parameters } = this.context
      const script = parameters.length > 0 && parameters[0] ? parameters[0] : ''
      if (script) {
        const commands = [
          `cd ${directory}`,
          `eval "${script}"`
        ]
        return commands.join(' && ')
      }
    }
    return ''
  }

}

module.exports = ExecTask
