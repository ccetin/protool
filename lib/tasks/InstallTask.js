'use strict'

const BaseTask = require('./BaseTask')
const NormalizeTask = require('./NormalizeTask')
const ShellWrapper = require('../ShellWrapper')

class InstallTask extends BaseTask {
  constructor(...args) {
    super(...args)
    this.verbose = true
  }

  async execute() {
    const { workingDirectory, cacheDirectory, options } = this.context
    const { npmLogLevel:loglevel } = options
    const npmLogLevel = loglevel || 'silent'
    await this.install({ workingDirectory, cacheDirectory, npmLogLevel })
  }

  async install({ workingDirectory, cacheDirectory, npmLogLevel }) {
    const { projectCacheDirectory } = NormalizeTask.getRelativeCacheDirectory({ workingDirectory, cacheDirectory })
    const verbose = this.verbose || this.logger.currentThreshold < 30
    await ShellWrapper.execute(`cd ${projectCacheDirectory} && npm --loglevel ${npmLogLevel} install`, verbose ? 'inherit' : 'ignore')
  }

}

module.exports = InstallTask
