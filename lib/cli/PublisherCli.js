'use strict'

const DefaultCli = require('./defaultCli')
const ProjectPublisher = require('../ProjectPublisher')

const CLI_OPTIONS = {
  registry: {
    flags:       '-r, --registry [registry]',
    description: 'Npm registry',
    default:     'https://registry.npmjs.org'
  }
}

class PublisherCli extends DefaultCli {
  constructor() {
    super({name: 'projpublisher', commandOptions: CLI_OPTIONS})
  }

  runSingleCommand() {
    try {
      const project = this.cliOptions().project
      const publisher = new ProjectPublisher(this.cliOptions())
      if (project) {
        publisher.executeTaskForSingleProject(project)
      } else {
        publisher.executeTaskForAllProjects()
      }
    } catch (e) {
      this.log.error(e.message)
      this.log.debug(e)
    }
  }

}

module.exports = PublisherCli
