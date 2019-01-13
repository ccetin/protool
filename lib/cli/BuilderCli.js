'use strict'

const DefaultCli = require('./defaultCli')
const ProjectBuilder = require('../ProjectBuilder')

const CLI_OPTIONS = {
  linkDependencies: {
    flags:       '-D, --link-dependencies',
    description: 'Npm link dependencies from global node_modules',
    default:     false
  },
  linkProject: {
    flags:       '-P, --link-project',
    description: 'Npm link project to global node_modules',
    default:     false
  }
}

class BuilderCli extends DefaultCli {
  constructor() {
    super({name: 'projbuilder', commandOptions: CLI_OPTIONS})
  }

  runSingleCommand() {
    try {
      const project = this.cliOptions().project
      const builder = new ProjectBuilder(this.cliOptions())
      if (project) {
        builder.executeTaskForSingleProject(project)
      } else {
        builder.executeTaskForAllProjects()
      }
    } catch (e) {
      this.log.error(e.message)
      this.log.debug(e)
    }
  }

}

module.exports = BuilderCli
