'use strict'

const BaseTask = require('./BaseTask')
const NormalizeTask = require('./NormalizeTask')
const ShellWrapper = require('../ShellWrapper')

class InstallTask extends BaseTask {
  constructor(...args) {
    super(...args)
    this.verbose = true
  }

  async execute(colors) {
    const { workingDirectory, cacheDirectory, options } = this.context
    const { npmLogLevel:loglevel, dryRun } = options
    const npmLogLevel = loglevel || 'silent'
    await this.executeCommand(colors, dryRun, { workingDirectory, cacheDirectory, npmLogLevel })
  }

  async executeCommand(colors, dryRun, { workingDirectory, cacheDirectory, npmLogLevel }) {
    const { projectCacheDirectory } = NormalizeTask.getRelativeCacheDirectory({ workingDirectory, cacheDirectory })
    const verbose = this.verbose || this.logger.currentThreshold < 30
    const command = `cd ${projectCacheDirectory} && npm --loglevel ${npmLogLevel} install`
    this.logger.debug(`Running: ${colors.gray(command)}`)
    if (!dryRun) {
      await ShellWrapper.execute(command, verbose ? 'inherit' : 'ignore')
    }
  }

}

module.exports = InstallTask
