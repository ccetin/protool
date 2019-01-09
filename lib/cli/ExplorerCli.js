'use strict'

const colors = require('colors')
const DefaultCli = require('./defaultCli')
const ProjectExplorer = require('../ProjectExplorer')

class ExplorerCli extends DefaultCli {
  constructor() {
    super({name: 'projexplorer'})
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
          for (const project of Object.values(projects)) {
            this.log.info(colors.yellow(project))
          }
        } catch (e) {
          this.log.error(e.message)
          this.log.debug(e)
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
          this.log.info(colors.yellow(explorer.treeView(graph)))
        } catch (e) {
          this.log.error(e.message)
          this.log.debug(e)
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
        const projects = await explorer.orderedProjects()
        try {
          for (const project of projects) {
            this.log.info(colors.yellow(`${project.projectPath}@${project.version}`))
          }
        } catch (e) {
          this.log.error(e.message)
          this.log.debug(e)
        }
      })
  }

}

module.exports = ExplorerCli
