'use strict'

const path = require('path')

const BaseTask = require('./BaseTask')
const Explorer = require('../Explorer')
const ShellWrapper = require('../ShellWrapper')
const Util = require('../Util')

class ShellTask extends BaseTask {
  constructor(...args) {
    super(...args)
    this.verbose = false
  }

  buildCommand() {
    this.missingImplementation()
  }

  async execute(colors) {
    const { workingDirectory, cacheDirectory, options, config } = this.context
    const { filter, scope: scopeOption, includeAll, npmLogLevel:loglevel, dryRun } = options
    const scope = scopeOption || config.scope
    const npmLogLevel = loglevel || 'silent'
    const filters = filter ? filter.split(',') : []
    const projects = await Explorer.orderedProjects(workingDirectory, scope, includeAll, filters)
    for (const [index, project] of projects.entries()) {
      await this.executeCommand(colors, dryRun,
        Object.assign({ workingDirectory, cacheDirectory, scope, filters, npmLogLevel }, project), index, projects.length)
    }
  }

  async executeCommand(colors, dryRun, project, index, total) {
    const start = Date.now()
    const verbose = this.verbose || this.logger.currentThreshold < 30
    const command = this.buildCommand(project)
    const { directory } = project
    const cwd = path.relative(this.context.workingDirectory, directory)
    this.logger.info(`${colors.green(this.taskName)} [ ${index + 1} / ${total}] > ${colors.cyan(cwd)}`)
    this.logger.debug(`Running: ${colors.gray(command.split('&&'))}`)
    let result = null
    if (!dryRun) {
      result = await ShellWrapper.execute(command, verbose ? 'inherit' : 'ignore')
    }
    const end = Date.now()
    this.logger.debug(`${((end - start) / 1000).toFixed(2)}s`)
    this.duration += end - start
    return result
  }

  async scanProject(project, scope) {
    const { workingDirectory } = this.context
    const directory = path.resolve(workingDirectory, project)
    const filename = path.join(directory, 'package.json')
    const exists = filename ? Util.isFile(filename) : false
    if (exists) {
      const projectName = path.basename(directory)
      const deserializedPackage = await Util.readJsonFile(filename)
      const packageDefinition = deserializedPackage.json
      const { name: packageName, version } = packageDefinition
      const dependencies = Object.keys(packageDefinition.dependencies)
      const scopedDependencies = dependencies.filter( (d) => { return this.isScoped(d.packageName, scope) })
      const otherDependencies = dependencies.filter( (d) => { return !this.isScoped(d, scope) })
      return {
        directory,
        packageName,
        version,
        filename,
        projectName,
        dependencies: { scopedDependencies, otherDependencies }
      }
    }
    return null
  }

}

module.exports = ShellTask
