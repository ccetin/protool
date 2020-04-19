'use strict'

const set = require('lodash.set')
const BaseTask = require('./BaseTask')
const Util = require('../Util')

class ConfigSetTask extends BaseTask {
  constructor(...args) {
    super(...args)
  }

  validate() {
    const { options, config, parameters } = this.context
    const { path: directory } = options
    let result = true
    if (!directory && !config && parameters.length !== 2 && !parameters[0]) {
      result = false
    }
    return result
  }

  async execute() {
    const { config, configFilename, parameters } = this.context
    const key = parameters[0]
    const value = parameters[1]
    set(config, key, value)
    await Util.writeJsonFile(configFilename, config)
  }

}

module.exports = ConfigSetTask
