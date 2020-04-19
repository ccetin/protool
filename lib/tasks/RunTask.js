'use strict'

const ShellTask = require('./ShellTask')

class RunTask extends ShellTask {
  constructor(...args) {
    super(...args)
    this.verbose = true
  }

  buildCommand({ directory, packageDefinition }) {
    if (directory) {
      const { parameters } = this.context
      const script = parameters.length > 0 && parameters[0] ? parameters[0] : ''
      if (script) {
        const { scripts } = packageDefinition
        if (scripts[script]) {
          const commands = [
            `cd ${directory}`,
            `npm run ${script}`
          ]
          return commands.join(' && ')
        } else {
          return `echo "[INFO]: ${script} not defined in package.json"`
        }
      }
    }
    return ''
  }

}

module.exports = RunTask
