'use strict'

const util = require('util')
const path = require('path')
const fs = require('fs')

const Shell = require('./Shell')
const ProjectExplorer = require('./ProjectExplorer')
const { log } = require('./Logger')

class BaseProjectTask {
  constructor(options) {
    const opts = Object.assign({}, options)
    this.account = opts.account || ''
    this.rootPath = path.resolve(opts.rootPath || path.resolve(process.env.PWD, '..'))
    this.explorer = new ProjectExplorer({ account: this.account, rootPath: this.rootPath })
    this.log = log
  }

  get taskName() {
    return null
  }

  async listCommands() {
    return await this.explorer.orderedProjectCommands( ({ projectPath, dependencies }) => {
      this.buildCommand(projectPath, dependencies)
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

        this.log.info(`Running ${this.taskName} command for -> ${command}`)
        return await Shell.execute(command)
      } else {
        throw new Error('No package.json file defined for project')
      }
    } catch (e) {
      this.log.error(e.message)
    }
  }

  async executeTaskForAllProjects() {
    let commands = await this.listCommands()
    commands.forEach( async(command) => {
      this.log.info(`Running ${this.taskName} command for -> ${command}`)
      return await Shell.execute(command)
    })
  }
}

module.exports = BaseProjectTask
