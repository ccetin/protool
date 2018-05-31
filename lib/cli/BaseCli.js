#!/usr/bin/env node

'use strict'

const path = require('path')
const Command = require('commander').Command

class BaseCli {
  constructor(options) {
    this.options = Object.assign({}, options)
    this.program = new Command(this.options.name)
    this.initialize()
  }

  static run() {
    return new this()
  }

  initialize() {
    const file = path.resolve(process.env.PWD, 'package.json')
    const packageDetail = require(file)
    this.program.version(packageDetail.version)
    this.initializeCliOptions()
    this.initializeCliCommands()
    this.program.parse(process.argv)
    if (this.program.args.length == 0) {
      this.eject()
    }
  }

  initializeCliOptions() {
  }

  initializeCliCommands() {
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
