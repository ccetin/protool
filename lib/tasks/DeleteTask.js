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
    const { code } = await this.executeCommand(colors, dryRun, { workingDirectory, cacheDirectory })
    return code
  }

  async executeCommand(colors, dryRun, { workingDirectory, cacheDirectory }) {
    const start = Date.now()
    const { projectCacheDirectory } = NormalizeTask.getRelativeCacheDirectory({ workingDirectory, cacheDirectory })
    const verbose = this.verbose || this.logger.currentThreshold < 30
    const command = `cd ${projectCacheDirectory} && rm -rf package-lock.json node_modules`
    this.logger.debug(`Running: ${colors.gray(command)}`)
    let result = null
    if (!dryRun) {
      result = await ShellWrapper.execute(command, verbose ? 'inherit' : 'ignore')
    } else {
      result = { code: 0 }
    }
    const end = Date.now()
    this.logger.debug(`${((end - start) / 1000).toFixed(2)}s`)
    this.duration += end - start
    return result
  }

}

module.exports = DeleteTask
