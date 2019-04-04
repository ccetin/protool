'use strict'

const BaseCli = require('./BaseCli')

const DEFAULT_CLI_OPTIONS = {
  account: {
    flags:       '-a, --account [account]',
    description: 'Npm account name (@scope)'
  },
  path: {
    flags:       '-i, --path [path]',
    description: 'Root project path'
  },
  loggerLevel: {
    flags:       '-l, --logger-level [loggerLevel]',
    description: 'Logging level',
    default:     'info'
  },
  project: {
    flags:       '-p, --project [project]',
    description: 'Target project name',
    default:     null
  },
  includeAll: {
    flags:       '-I, --include-all',
    description: 'Include all the project in source directory (project without account prefix)',
    default:     false
  }
}

class DefaultCli extends BaseCli {
  constructor(options) {
    super(options)
  }

  initializeCliOptions() {
    super.initializeCliOptions()
    const customOptions = Object.assign({}, DEFAULT_CLI_OPTIONS, this.commandOptions)
    for (const name in customOptions) {
      const param = customOptions[name]
      this.program.option(param.flags, param.description, param.default)
    }
  }

  cliOptions() {
    const opts = {}
    const customOptions = Object.assign({}, DEFAULT_CLI_OPTIONS, this.commandOptions)
    for (const name in customOptions) {
      opts[name] = this.program[name]
    }
    return Object.assign({}, super.cliOptions(), opts)
  }

}

module.exports = DefaultCli
