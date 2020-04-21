'use strict'

const BaseTask = require('./BaseTask')
const NormalizeTask = require('./NormalizeTask')
const ShellWrapper = require('../ShellWrapper')

class DeleteTask extends BaseTask {
  constructor(...args) {
    super(...args)
    this.verbose = true
  }

  async execute() {
    const { workingDirectory, cacheDirectory } = this.context
    await this.delete({ workingDirectory, cacheDirectory })
  }

  async delete({ workingDirectory, cacheDirectory }) {
    const { projectCacheDirectory } = NormalizeTask.getRelativeCacheDirectory({ workingDirectory, cacheDirectory })
    const verbose = this.verbose || this.logger.currentThreshold < 30
    await ShellWrapper.execute(`cd ${projectCacheDirectory} && rm -rf package-lock.json node_modules`, verbose ? 'inherit' : 'ignore')
  }

}

module.exports = DeleteTask
