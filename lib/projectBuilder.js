'use strict'

const util = require('util')
const path = require('path')
const fs = require('fs')

const BaseProjectTask = require('./BaseProjectTask')
const Shell = require('./Shell')

class ProjectBuilder extends BaseProjectTask {
  constructor(options) {
    super(options)
    const opts = Object.assign({}, options)
    this.link = opts.link === undefined ? false : opts.link
  }

  buildCommand(projectPath, dependencies) {
    let commands = [`cd ${projectPath}`, 'rm -rf node_modules']
    if (dependencies && dependencies.length > 0 && this.link) {
      commands.push(`npm --loglevel warn link ${dependencies.join(' ')}`)
    }
    commands.push('npm --loglevel warn install')
    if (this.link) {
      commands.push('npm --loglevel warn link')
    }
    return commands.join(' && ')
  }

  async executeTaskForSingleProject(project) {
    let projectPath = path.resolve(this.rootPath, project)
    let file = path.join(projectPath, 'package.json')
    try {
      const statAsync = util.promisify(fs.stat)
      const stat = await statAsync(file)
      if (stat.isFile()) {
        let packageDetail = require(file)
        let dependencies = []
        if (packageDetail.dependencies) {
          let projects = await this.listProjects()
          Object.keys(packageDetail.dependencies).forEach( (dependency) => {
            if (this.account && dependency.startsWith(`${this.account}/`)
              || !this.account && !!projects[dependency]) {
              dependencies.push(dependency)
            }
          })
        }
        let command = this.buildCommand(projectPath, dependencies)

        this.log.info(`Running ${this.taskName} command for -> ${command}`)
        return await Shell.execute(command)
      } else {
        throw new Error('No package.json file defined for project')
      }
    } catch (e) {
      this.log.error(e.message)
    }
  }

}

module.exports = ProjectBuilder
