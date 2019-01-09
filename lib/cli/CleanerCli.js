'use strict'

const DefaultCli = require('./defaultCli')
const ProjectCleaner = require('../ProjectCleaner')

class CleanerCli extends DefaultCli {
  constructor() {
    super({name: 'projcleaner'})
  }

  runSingleCommand() {
    try {
      const project = this.cliOptions().project
      const cleaner = new ProjectCleaner(this.cliOptions())
      if (project) {
        cleaner.executeTaskForSingleProject(project)
      } else {
        cleaner.executeTaskForAllProjects()
      }
    } catch (e) {
      this.log.error(e.message)
      this.log.debug(e)
    }
  }

}

module.exports = CleanerCli
