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
    const { code } = await this.executeCommand(colors, dryRun, { workingDirectory, cacheDirectory, npmLogLevel })
    return code
  }

  async executeCommand(colors, dryRun, { workingDirectory, cacheDirectory, npmLogLevel }) {
    const start = Date.now()
    const { projectCacheDirectory } = NormalizeTask.getRelativeCacheDirectory({ workingDirectory, cacheDirectory })
    const verbose = this.verbose || this.logger.currentThreshold < 30
    const command = `cd ${projectCacheDirectory} && npm --loglevel ${npmLogLevel} install`
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

module.exports = InstallTask
