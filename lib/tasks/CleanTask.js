'use strict'

const path = require('path')
const ShellTask = require('./ShellTask')
const Explorer = require('../Explorer')

class CleanTask extends ShellTask {
  constructor(...args) {
    super(...args)
  }

  async execute(colors) {
    const { paths, options, config } = this.context
    const { filter, scope: scopeOption, includeAll, npmLogLevel:loglevel, dryRun, exitOnFail } = options
    const scope = scopeOption || config.scope
    const npmLogLevel = loglevel || 'warn'
    const filters = filter ? filter.split(',') : []
    const projects = await Explorer.orderedProjects(paths, scope, includeAll, filters)
    let result = 0
    for (const [index, project] of projects.reverse().entries()) {
      const info = Object.assign({ scope, filters, npmLogLevel }, project)
      const { code } = await this.executeCommand(colors, dryRun, info, index, projects.length)
      if (exitOnFail && code > 0) {
        return code
      }
      result += code
    }
    return result
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
