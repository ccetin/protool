'use strict'

const path = require('path')

const ProjectExplorer = require('./ProjectExplorer')
const Logger = require('./Logger')

class BaseProjectTask {
  constructor(options) {
    const opts = Object.assign({}, options)
    this.account = opts.account || ''
    this.rootPath = path.resolve(opts.path)
    this.explorer = new ProjectExplorer({ account: this.account, path: this.rootPath })
    this.log = new Logger({ level: opts.loggerLevel })
  }

  get taskName() {
    return null
  }

}

module.exports = BaseProjectTask
