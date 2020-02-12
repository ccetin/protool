'use strict'

const util = require('util')
const path = require('path')
const fs = require('fs')
const colors = require('colors')

const BaseProjectShellTask = require('./BaseProjectShellTask')
const ShellWrapper = require('./ShellWrapper')

class ProjectBuilder extends BaseProjectShellTask {
  constructor(options) {
    super(options)
    const opts = Object.assign({}, options)
    this.linkDependencies = !!opts.linkDependencies
    this.linkProject = !!opts.linkProject
  }

  get taskName() {
    return 'Builder'
  }

  buildCommand(projectPath, dependencies) {
    if (projectPath) {
      const commands = [`cd ${projectPath}`]
      if (dependencies && dependencies.length > 0 && this.linkDependencies) {
        commands.push(`npm --loglevel warn link ${dependencies.join(' ')}`)
      }
      commands.push('npm --loglevel warn install')
      if (this.linkProject) {
        commands.push('npm --loglevel warn link')
      }
      return commands.join(' && ')
    }
    return ''
  }

  async executeTaskForSingleProject(project) {
    const projectPath = path.resolve(this.rootPath, project)
    const file = path.join(projectPath, 'package.json')
    try {
      const statAsync = util.promisify(fs.stat)
      const stat = await statAsync(file)
      if (stat.isFile()) {
        const packageDetail = require(file)
        const dependencies = []
        if (packageDetail.dependencies) {
          const projects = await this.explorer.listProjects()
          for (const dependency in packageDetail.dependencies) {
            if (this.account && dependency.startsWith(`${this.account}/`)
              || !this.account && !!projects[dependency]) {
              dependencies.push(dependency)
            }
          }
        }
        const command = this.buildCommand(projectPath, dependencies)

        this.log.info(`Running ${colors.green(this.taskName)} : ${colors.cyan(projectPath)}`)
        return await ShellWrapper.execute(command)
      } else {
        throw new Error('No package.json file defined for project')
      }
    } catch (e) {
      this.log.error(e.message)
    }
  }

}

module.exports = ProjectBuilder
