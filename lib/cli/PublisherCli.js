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
    super({name: 'project-publisher'})
  }

  initializeCliCommands() {
    super.initializeCliCommands()
    this.program
      .command('publish [project]')
      .description('Publish npm modules and link them')
      .action( async(project) => {
        try {
          const publisher = new ProjectPublisher(this.cliOptions())
          if (project) {
            publisher.executeTaskForSingleProject(project)
          } else {
            publisher.executeTaskForAllProject()
          }
        } catch (e) {
          this.log.error(e.message)
          this.log.debug(e)
        }
      })
  }

  initializeCliOptions() {
    super.initializeCliOptions()
    for (const name of Object.keys(CLI_OPTIONS)) {
      const param = CLI_OPTIONS[name]
      this.program.option(param.flags, param.description, param.default)
    }
  }

  cliOptions() {
    const opts = {}
    for (const name of Object.keys(CLI_OPTIONS)) {
      opts[name] = this.program[name]
    }
    return Object.assign({}, super.cliOptions(), opts)
  }

}

module.exports = PublisherCli
