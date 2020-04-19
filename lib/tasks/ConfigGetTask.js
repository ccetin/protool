'use strict'

const get = require('lodash.get')
const BaseTask = require('./BaseTask')

class ConfigGetTask extends BaseTask {
  constructor(...args) {
    super(...args)
  }

  validate() {
    const { options, config, parameters } = this.context
    const { path: directory } = options
    let result = true
    if (!directory && !config && parameters.length !== 1 && !parameters[0]) {
      result = false
    }
    return result
  }

  async execute(colors) {
    const { config, parameters } = this.context
    const key = parameters[0]
    const value = get(config, key)
    if (value) {
      this.logger.info(colors.yellow(`${key}: ${value}`))
    } else {
      this.logger.info(colors.red(`No "${key}" key defined in config`))
    }
  }

}

module.exports = ConfigGetTask
