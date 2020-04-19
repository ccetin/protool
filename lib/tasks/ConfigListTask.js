'use strict'

const BaseTask = require('./BaseTask')

class ConfigListTask extends BaseTask {
  constructor(...args) {
    super(...args)
  }

  validate() {
    const { options, config } = this.context
    const { path: directory } = options
    let result = true
    if (!directory && !config) {
      result = false
    }
    return result
  }

  async execute(colors) {
    const { config } = this.context
    this.logger.info(colors.yellow(JSON.stringify(config, null, 4)))
  }

}

module.exports = ConfigListTask
