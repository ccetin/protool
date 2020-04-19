'use strict'

const ShellTask = require('./ShellTask')

class StatusTask extends ShellTask {
  constructor(...args) {
    super(...args)
    this.verbose = true
  }

  buildCommand({ directory }) {
    if (directory) {
      return `cd ${directory} && git status -sb --untracked-files=no`
    }
    return ''
  }

}

module.exports = StatusTask
