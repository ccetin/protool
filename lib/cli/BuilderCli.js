'use strict'

const DefaultCli = require('./defaultCli')
const ProjectBuilder = require('../ProjectBuilder')

class BuilderCli extends DefaultCli {
  constructor() {
    super({name: 'project-builder'})
  }

  initializeCliCommands() {
    super.initializeCliCommands()
    this.program
      .command('install [project]')
      .description('Install npm modules and link them')
      .action( async(project) => {
        try {
          const builder = new ProjectBuilder(this.cliOptions())
          if (project) {
            builder.executeTaskForSingleProject(project)
          } else {
            builder.executeTaskForAllProject()
          }
        } catch (e) {
          console.log(e.message) // eslint-disable-line
        }
      })
  }

}

module.exports = BuilderCli
