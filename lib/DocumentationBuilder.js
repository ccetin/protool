'use strict'

const path = require('path')

const BaseProjectShellTask = require('./BaseProjectShellTask')

const JSDOC_RELATIVE_PATH = '/node_modules/jsdoc/.bin/jsdoc'

class DocumentationBuilder extends BaseProjectShellTask {
  constructor(options) {
    super(options)
  }

  get taskName() {
    return 'Jsdoc'
  }

  buildCommand(projectPath, dependencies) { // eslint-disable-line
    const jsdocBinary = path.resolve(process.env.PWD, JSDOC_RELATIVE_PATH)
    const commands = [`cd ${projectPath}`, `${jsdocBinary} .`]
    return commands.join(' && ')
  }

}

module.exports = DocumentationBuilder
