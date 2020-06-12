'use strict'

const BaseTask = require('./BaseTask')
const Explorer = require('../Explorer')

class TreeTask extends BaseTask {
  constructor(...args) {
    super(...args)
  }

  async execute(colors) {
    const { paths, options, config } = this.context
    const { filter, scope: scopeOption, includeAll } = options
    const scope = scopeOption || config.scope
    const filters = filter ? filter.split(',') : []
    const { graph, mapping } = await Explorer.buildProjectGraph(paths, scope, includeAll, filters)
    this.logger.info(colors.yellow(Explorer.treeView(graph, mapping)))
  }

}

module.exports = TreeTask
