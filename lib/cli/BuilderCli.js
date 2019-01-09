'use strict'

const DefaultCli = require('./defaultCli')
const ProjectBuilder = require('../ProjectBuilder')

const CLI_OPTIONS = {
  link: {
    flags:       '-l, --link',
    description: 'Npm link dependencies',
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
