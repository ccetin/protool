'use strict'

const DefaultCli = require('./defaultCli')
const ProjectExplorer = require('../ProjectExplorer')
const { log } = require('../Logger')

class ExplorerCli extends DefaultCli {
  constructor() {
    super({name: 'project-explorer'})
  }

  initializeCliCommands() {
    super.initializeCliCommands()
    this.program
      .command('list')
      .description('List all available projects')
      .action( async() => {
        if (!this.program.path) {
          this.eject()
        }
        try {
          const explorer = new ProjectExplorer(this.cliOptions())
          const projects = await explorer.listProjects()
          Object.values(projects).forEach( (project) => {
            log.info(project)
          })
        } catch (e) {
          log.error(e.message)
        }
      })

    this.program
      .command('tree')
      .description('Display project tree')
      .action( async() => {
        if (!this.program.path) {
          this.eject()
        }
        try {
          const explorer = new ProjectExplorer(this.cliOptions())
          const { graph } = await explorer.buildProjectGraph()
          log.info(explorer.treeView(graph))
        } catch (e) {
          log.error(e.message)
        }
      })

    this.program
      .command('graph')
      .description('Display project graph build order')
      .action( async() => {
        if (!this.program.path) {
          this.eject()
        }
        const explorer = new ProjectExplorer(this.cliOptions())
        const { graph } = await explorer.buildProjectGraph()
        try {
          graph.topologicalSort().forEach( (project) => {
            log.info(project)
          })
        } catch (e) {
          log.error(e.message)
        }
      })
  }

}

module.exports = ExplorerCli
