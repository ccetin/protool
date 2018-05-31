'use strict'

const DefaultCli = require('./defaultCli')
const ProjectPublisher = require('../ProjectPublisher')
const { log } = require('../Logger')

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
          log.error(e.message)
        }
      })
  }

  initializeCliOptions() {
    super.initializeCliOptions()
    for (let name of Object.keys(CLI_OPTIONS)) {
      let param = CLI_OPTIONS[name]
      this.program.option(param.flags, param.description, param.default)
    }
  }

  cliOptions() {
    let opts = {}
    for (let name of Object.keys(CLI_OPTIONS)) {
      opts[name] = this.program[name]
    }
    return Object.assign({}, super.cliOptions(), opts)
  }

}

module.exports = PublisherCli
