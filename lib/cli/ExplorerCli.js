'use strict'

const DefaultCli = require('./defaultCli')
const ProjectExplorer = require('../ProjectExplorer')

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
        try {
          const explorer = new ProjectExplorer(this.cliOptions())
          const projects = await explorer.listProjects()
          Object.values(projects).forEach( (project) => {
            console.log(project) // eslint-disable-line
          })
        } catch (e) {
          console.log(e.message) // eslint-disable-line
        }
      })

    this.program
      .command('tree')
      .description('Display project tree')
      .action( async() => {
        try {
          const explorer = new ProjectExplorer(this.cliOptions())
          const { graph } = await explorer.buildProjectGraph()
          console.log(explorer.treeView(graph)) // eslint-disable-line
        } catch (e) {
          console.log(e.message) // eslint-disable-line
        }
      })

    this.program
      .command('graph')
      .description('Display project graph build order')
      .action( async() => {
        const explorer = new ProjectExplorer(this.cliOptions())
        const { graph } = await explorer.buildProjectGraph()
        try {
          graph.topologicalSort().forEach( (project) => {
            console.log(`${project}`) // eslint-disable-line
          })
        } catch (e) {
          throw new Error('Cannot create a topological sort from dependency graph')
        }
      })
  }

}

module.exports = ExplorerCli
