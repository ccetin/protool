#!/usr/bin/env node

'use strict'

const path = require('path')
const Command = require('commander').Command
const Logger = require('../Logger')

class BaseCli {
  constructor(options) {
    const opts = Object.assign({}, options)
    this.program = new Command(opts.name)
    this.commandOptions = opts.commandOptions
    this.initialize()
  }

  static run() {
    return new this()
  }

  initialize() {
    const file = path.resolve(path.normalize(`${__dirname}/../..`), 'package.json')
    const packageDetail = require(file)
    this.program.version(packageDetail.version)
    this.initializeCliOptions()
    this.initializeCliCommands()
    this.program.parse(process.argv)
    if (this.program.rawArgs.length === 0) {
      this.eject()
    }
    this.log = new Logger({ level: this.cliOptions().loggerLevel })
    this.runSingleCommand()
  }

  initializeCliCommands() {
  }

  runSingleCommand() {
  }

  initializeCliOptions() {
  }

  cliOptions() {
    return {}
  }

  eject() {
    this.program.outputHelp()
    process.exit(1)
  }
}

module.exports = BaseCli
