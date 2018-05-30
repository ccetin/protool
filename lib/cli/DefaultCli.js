'use strict'

const BaseCli = require('./BaseCli')

const DEFAULT_CLI_OPTIONS = {
  credentialsFile: {
    flags:       '-a, --account [account]',
    description: 'Npm account name (@scope)'
  },
  profile: {
    flags:       '-p, --path [path]',
    description: 'Root project path'
  },
  region: {
    flags:       '-r, --registry [registry]',
    description: 'Npm registry',
    default:     'https://npmjs.org'
  },
  roleName: {
    flags:       '-l, --link',
    description: 'Npm link dependencies',
    default:     false
  }
}

class DefaultCli extends BaseCli {
  constructor(options) {
    super(options)
  }

  initializeCliOptions() {
    super.initializeCliOptions()
    for (let name of Object.keys(DEFAULT_CLI_OPTIONS)) {
      let param = DEFAULT_CLI_OPTIONS[name]
      this.program.option(param.flags, param.description, param.default)
    }
  }

  cliOptions() {
    let opts = {}
    for (let name of Object.keys(DEFAULT_CLI_OPTIONS)) {
      opts[name] = this.program[name]
    }
    return Object.assign({}, super.cliOptions(), opts)
  }

}

module.exports = DefaultCli