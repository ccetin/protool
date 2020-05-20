'use strict'

const { Command } = require('commander')
const Logger = require('./Logger')
const Util = require('./Util')

class Cli {

  static get targetDirectory() {
    return __dirname
  }

  static set loggerLevel(level) {
    this._loggerLevel = level || process.env.LOGGER_LEVEL || 'info'
    this._logger = new Logger({ level: this._loggerLevel })
  }

  static get loggerLevel() {
    return this._loggerLevel
  }

  static get logger() {
    if (!this._logger) {
      this._logger = new Logger({ level: this.loggerLevel || process.env.LOGGER_LEVEL || 'info' })
    }
    return this._logger
  }

  static async run(options) {
    try {
      const filename = await Util.resolveBasedir('package.json', Cli.targetDirectory)
      const deserializedPackage = await Util.readJsonFile(filename)
      const { name, version, bin } = deserializedPackage.json
      const label = bin && Object.keys(bin).length > 0 ? Object.keys(bin).join(' | ') : name
      const params = Object.assign({ name: label, version, configName: 'project.json', cacheDirectory: '~/.cache' }, options)
      const { configName, cacheDirectory } = params
      const configFilename = await Util.resolveBasedir(configName, process.cwd())
      const config = await Cli.deserializeConfig(configFilename)
      const ctx = { config, configName, configFilename, cacheDirectory }
      Cli.execute(params, process.argv, ctx)
    } catch (e) {
      Cli.logger.error(e)
    }
  }

  static async deserializeConfig(filename) {
    const isFile = filename ? await Util.isFile(filename) : false
    const deserializedConfig = isFile ? await Util.readJsonFile(filename) : null
    const config = deserializedConfig ? deserializedConfig.json : null
    return config
  }

  static build(config) {
    const { name, main, options = [], commands = [], version } = config
    const command = new Command(name)
    command.version(version)
    if (main) {
      command.action(main)
    }
    Cli.buildOptions(command, options)
    Cli.buildCommands(command, commands)
    return command
  }

  static buildOptions(command, options) {
    for (const name in options) {
      const param = options[name]
      command.option(param.flags, param.description, param.parser, param.default)
    }
  }

  static buildCommands(command, commands) {
    for (const c of commands) {
      const cmd = command
        .command(c.name, c.alias)
        .action(c.action)
        .description(c.description, c.argumentDescriptions)
      if (Array.isArray(c.commands)) {
        Cli.buildCommands(cmd, c.commands)
      }
      if (Array.isArray(c.options)) {
        Cli.buildOptions(cmd, c.options)
      }
    }
  }

  static execute(params = {}, argv = [], executionContext = {}) {
    const command = params instanceof Command ? params : Cli.build(params)
    command.executionContext = executionContext
    if (Array.isArray(argv) && argv.length > 0) {
      command.parse(argv)
    } else {
      const helpText = command ? command.helpInformation() : ''
      Cli.logger.warn(helpText)
    }
  }

  static absoluteName(command, list = []) {
    if (command) {
      list.unshift(command._name)
      return Cli.absoluteName(command.parent, list)
    }
    return list.join('-')
  }

  static root(command) {
    if (command) {
      return command.parent ? Cli.root(command.parent) : command
    }
    return null
  }

  static getOption(command, key) {
    if (command) {
      if (key in command) {
        return command[key]
      }
      return Cli.getOption(command.parent, key)
    }
    return null
  }

  static printUsage(...args) {
    const command = args.length > 0 ? args[0] : null
    const helpText = command ? command.helpInformation() : ''
    Cli.logger.warn(helpText)
  }
}

module.exports = Cli
