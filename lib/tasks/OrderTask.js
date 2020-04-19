'use strict'

const BaseTask = require('./BaseTask')
const Explorer = require('../Explorer')

class OrderTask extends BaseTask {
  constructor(...args) {
    super(...args)
  }

  async execute(colors) {
    const { workingDirectory, options, config } = this.context
    const { filter, scope: scopeOption, includeAll } = options
    const scope = scopeOption || config.scope
    const filters = filter ? filter.split(',') : []
    const projects = await Explorer.orderedProjects(workingDirectory, scope, includeAll, filters)
    for (const project of projects) {
      this.logger.info(colors.yellow(`${project.directory}@${project.version}`))
    }
  }

}

module.exports = OrderTask
