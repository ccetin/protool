'use strict'

const DefaultCli = require('./defaultCli')
const ProjectBuilder = require('../ProjectBuilder')
const { log } = require('../Logger')

const CLI_OPTIONS = {
  link: {
    flags:       '-l, --link',
    description: 'Npm link dependencies',
    default:     false
  }
}

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
          log.error(e.message)
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

module.exports = BuilderCli
