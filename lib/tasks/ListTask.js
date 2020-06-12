'use strict'

const BaseTask = require('./BaseTask')
const Explorer = require('../Explorer')

class ListTask extends BaseTask {
  constructor(...args) {
    super(...args)
  }

  async execute(colors) {
    const { paths } = this.context
    const projects = await Explorer.listProjects(paths)
    for (const project of Object.values(projects)) {
      this.logger.info(colors.yellow(project.directory))
    }
  }

}

module.exports = ListTask
