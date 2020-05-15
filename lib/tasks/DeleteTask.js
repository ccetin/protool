'use strict'

const BaseTask = require('./BaseTask')
const NormalizeTask = require('./NormalizeTask')
const ShellWrapper = require('../ShellWrapper')

class DeleteTask extends BaseTask {
  constructor(...args) {
    super(...args)
    this.verbose = true
  }

  async execute(colors) {
    const { workingDirectory, cacheDirectory, options } = this.context
    const { dryRun } = options
    await this.executeCommand(colors, dryRun, { workingDirectory, cacheDirectory })
  }

  async executeCommand(colors, dryRun, { workingDirectory, cacheDirectory }) {
    const { projectCacheDirectory } = NormalizeTask.getRelativeCacheDirectory({ workingDirectory, cacheDirectory })
    const verbose = this.verbose || this.logger.currentThreshold < 30
    const command = `cd ${projectCacheDirectory} && rm -rf package-lock.json node_modules`
    this.logger.debug(`Running: ${colors.gray(command)}`)
    if (!dryRun) {
      await ShellWrapper.execute(command, verbose ? 'inherit' : 'ignore')
    }
  }

}

module.exports = DeleteTask
