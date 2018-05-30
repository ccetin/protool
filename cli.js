#!/usr/bin/env node

const program = require('commander')
const ProjectBuilder = require('./lib/projectBuilder')
const ProjectPublisher = require('./lib/ProjectPublisher')
const ProjectExplorer = require('./lib/ProjectExplorer')

const options = (program) => {
  return {
    account:  program.account,
    rootPath: program.path,
    registry: program.registry,
    link:     program.link
  }
}

program
  .version('1.0.0')
  .option('-a, --account [account]', 'Npm account Name')
  .option('-p, --path [path]', 'Root project path')
  .option('-r, --registry [registry]', 'Npm registry')
  .option('-l, --link', 'Npm link dependencies')

program
  .command('list-projects')
  .description('List all available projects')
  .action( async() => {
    const explorer = new ProjectExplorer(options(program))
    const projects = await explorer.listProjects()
    Object.values(projects).forEach( (project) => {
      console.log(project)
    })

  })

program
  .command('install-project [project]')
  .description('Install npm modules and link them')
  .action( (project) => {
    if (!program.account) {
      throw new Error('No account selected')
    }
    const projectBuilder = new ProjectBuilder(options(program))
    if (project) {
      projectBuilder.executeTaskForSingleProject(project)
    } else {
      projectBuilder.executeTaskForAllProject()
    }
  })

program
  .command('publish-project [project]')
  .description('Publish npm modules and link them')
  .action( (project) => {
    if (!program.account) {
      throw new Error('No account selected')
    }
    const publisher = new ProjectPublisher(options(program))
    if (project) {
      publisher.executeTaskForSingleProject(project)
    } else {
      publisher.executeTaskForAllProject()
    }
  })

program
  .command('projects-tree')
  .description('Display project tree')
  .action( async() => {
    const explorer = new ProjectExplorer(options(program))
    const { graph } = await explorer.buildProjectGraph()
    console.log(explorer.treeView(graph))
  })

program
  .command('projects-graph')
  .description('Display project graph build order')
  .action( async() => {
    const explorer = new ProjectExplorer(options(program))
    const { graph } = await explorer.buildProjectGraph()
    try {
      graph.topologicalSort().forEach( (project) => {
        console.log(`${project}`)
      })
    } catch (e) {
      throw new Error('Cannot create a topological sort from dependency graph')
    }
  })

program
  .parse(process.argv)

if (program.args.length == 0) {
  program.outputHelp()
  process.exit(1)
}
