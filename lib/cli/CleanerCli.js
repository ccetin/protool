'use strict'

const DefaultCli = require('./defaultCli')
const ProjectCleaner = require('../ProjectCleaner')

class CleanerCli extends DefaultCli {
  constructor() {
    super({name: 'project-cleaner'})
  }

  initializeCliCommands() {
    super.initializeCliCommands()
    this.program
      .command('clean [project]')
      .description('Clean project npm modules')
      .action( async(project) => {
        try {
          const builder = new ProjectCleaner(this.cliOptions())
          if (project) {
            builder.executeTaskForSingleProject(project)
          } else {
            builder.executeTaskForAllProjects()
          }
        } catch (e) {
          this.log.error(e.message)
          this.log.debug(e)
        }
      })
  }

}

module.exports = CleanerCli
