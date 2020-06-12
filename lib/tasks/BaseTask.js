'use strict'

const os = require('os')
const path = require('path')
const { Command } = require('commander')
const colors = require('colors/safe')
const Cli = require('../Cli')
const Option = require('../Option')

class BaseTask {
  constructor(...args) {
    this._command = args.length > 0 ?
      args.filter( (a) => { return a instanceof Command })[0] : null
    const parameters = args.length > 0 ?
      args.filter( (a) => { return !(a instanceof Command || Array.isArray(a)) }) : []
    const unknown = args.length > 0 ?
      args.filter( (a) => { return Array.isArray(a) }) : []
    this._context = { parameters, unknown }
    this.duration = 0
  }

  get command() {
    return this._command
  }

  get parameters() {
    return this._parameters
  }

  get context() {
    return this._context
  }

  get logger() {
    return Cli.logger
  }

  get taskName() {
    return this.absoluteName()
  }

  absoluteName() {
    return Cli.absoluteName(this.command)
  }

  root() {
    return Cli.root(this.command)
  }

  getOption(key) {
    return Cli.getOption(this.command, key)
  }

  getValue(key) {
    const { options, config } = this.context
    return options[key] !== null ? options[key] : (config ? config[key] : null)
  }

  isScoped(dependency) {
    const scope = this.getOption('scope')
    return scope && dependency && dependency.startsWith(`@${scope}/`)
  }

  async initialize() {
    const ctx = this.root().executionContext
    const { config, configName } = ctx
    ctx.options = {}
    for (const name of Option.keys()) {
      const value = this.getOption(name)
      ctx.options[name] = value
    }
    if (!config) {
      if (ctx.options.path) {
        const filename = path.join(path.resolve(ctx.options.path), configName)
        const conf = await Cli.deserializeConfig(filename)
        if (conf) {
          ctx.config = conf
          ctx.configFilename = filename
        }
      }
    }
    const cacheDirectory = ctx.cacheDirectory.startsWith('~') ?
      ctx.cacheDirectory.replace('~', os.homedir()) : ctx.cacheDirectory
    const cwd = ctx.configFilename ? path.dirname(ctx.configFilename) : null
    const workingDirectory = this.getOption('path') || cwd
    const paths = Array.isArray(ctx.config.groups) ? ctx.config.groups.map( (g) => { return g.path }) : []
    this._context.options = ctx.options
    this._context.config = ctx.config
    this._context.configName = ctx.configName
    this._context.configFilename = ctx.configFilename
    this._context.workingDirectory = workingDirectory
    this._context.paths = Array.from(new Set([workingDirectory].concat(paths)))
    this._context.cacheDirectory = path.resolve(cacheDirectory)
    Cli.loggerLevel = ctx.options.loggerLevel || (this.config ? this.config.loggerLevel : null)
    if (!config) {
      Cli.logger.warn(colors.red(`[WARNING]: No [${configName}] found in parent directory hieracy\n`))
      if (ctx.configFilename) {
        Cli.logger.warn(colors.yellow(`[WARNING]: Reading [${configName}] from ${path.dirname(ctx.configFilename)}\n`))
      }
    }
  }

  async execute() {
    this.missingImplementation()
  }

  validate() {
    const { workingDirectory } = this.context
    let result = true
    if (!workingDirectory) {
      result = false
    }
    return result
  }

  async missingImplementation() {
    Cli.logger.debug(this.command)
    Cli.logger.error(`>>> implementation for ${this.taskName} missing`)
    process.exit(1)
  }

  static action(options) {
    const Class = this.prototype.constructor
    return async(...args) => {
      try {
        const start = Date.now()
        const instance = new Class(...args)
        await instance.initialize()
        if (!instance.validate()) {
          throw new Error('Command not valid, missing required configuration entry or inline option value')
        }
        const { workingDirectory } = instance.context
        instance.logger.warn(`Executing ${colors.green(instance.taskName)} in ${colors.cyan(workingDirectory)}`)
        return instance.execute(colors, options)
          .then( (code) => {
            if (instance.duration === 0) {
              instance.duration = Date.now() - start
            }
            instance.logger.info(`Total time: ${((instance.duration) / 1000).toFixed(2)}s`)
            process.exitCode = code
          })
      } catch (e) { console.log(e)
        process.exitCode = 1
        Cli.logger.error(colors.red(e.message))
        Cli.logger.debug(colors.yellow(e.stack))
      }
    }
  }

}

module.exports = BaseTask
