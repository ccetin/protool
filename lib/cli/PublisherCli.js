'use strict'

const DefaultCli = require('./defaultCli')
const ProjectPublisher = require('../ProjectPublisher')

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
          console.log(e.message) // eslint-disable-line
        }
      })
  }

}

module.exports = PublisherCli
