'use strict'

const path = require('path')
const ShellTask = require('./ShellTask')
const Explorer = require('../Explorer')

class CleanTask extends ShellTask {
  constructor(...args) {
    super(...args)
  }

  async execute(colors) {
    const { workingDirectory, options, config } = this.context
    const { filter, scope: scopeOption, includeAll, npmLogLevel:loglevel, dryRun } = options
    const scope = scopeOption || config.scope
    const npmLogLevel = loglevel || 'warn'
    const filters = filter ? filter.split(',') : []
    const projects = await Explorer.orderedProjects(workingDirectory, scope, includeAll, filters)
    for (const [index, project] of projects.reverse().entries()) {
      await this.executeCommand(colors, dryRun, Object.assign({ scope, filters, npmLogLevel }, project), index, projects.length)
    }
  }

  buildCommand({ directory, packageName }) {
    if (directory) {
      const name = path.basename(directory)
      const inGlobal = this.getOption('global')
      if (name) {
        const rmLockfile = this.getOption('rmLockfile')
        const commands = [`cd ${directory}`, 'rm -rf node_modules']
        if (rmLockfile) {
          commands.push('rm -rf package-lock.json')
        }
        if (inGlobal) {
          commands.push(`[ -L "$( npm config get prefix )/lib/node_modules/${packageName}" ]`)
          commands.push(`rm "$( npm config get prefix )/lib/node_modules/${packageName}"`)
        }
        return commands.join(' && ')
      }
    }
    return ''
  }

}

module.exports = CleanTask
