'use strict'

const util = require('util')
const path = require('path')
const fs = require('fs')
const colors = require('colors/safe')

const BaseProjectTask = require('./BaseProjectTask')
const ShellWrapper = require('./ShellWrapper')

class BaseProjectShellTask extends BaseProjectTask {
  constructor(options) {
    super(options)
  }

  async listCommands() {
    return await this.explorer.orderedProjectCommands( ({ projectPath, dependencies }) => {
      const command = this.buildCommand(projectPath, dependencies)
      return { command, projectPath }
    })
  }

  buildCommand(projectPath, dependencies) { // eslint-disable-line
    return null
  }

  async executeTaskForSingleProject(project) {
    let projectPath = path.resolve(this.rootPath, project)
    let file = path.join(projectPath, 'package.json')
    try {
      const statAsync = util.promisify(fs.stat)
      const stat = await statAsync(file)
      if (stat.isFile()) {
        let packageDetail = require(file)
        let command = this.buildCommand(projectPath, Object.keys(packageDetail.dependencies))

        this.log.info(`Running ${colors.green(this.taskName)} : ${colors.cyan(projectPath)}`)
        return await ShellWrapper.execute(command)
      } else {
        throw new Error('No package.json file defined for project')
      }
    } catch (e) {
      this.log.error(e.message)
    }
  }

  async executeTaskForAllProjects() {
    let commands = await this.listCommands()
    for (const item of commands) {
      const { command, projectPath } = item
      this.log.info(`\nRunning ${colors.green(this.taskName)} : ${colors.cyan(projectPath)}`)
      await ShellWrapper.execute(command)
    }
  }
}

module.exports = BaseProjectShellTask
