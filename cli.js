#!/usr/bin/env node

const Promise = require('bluebird');
const program = require('commander');
const ProjectBuilder = require('./lib/projectBuilder');

const options = (program) => {
  return {
    account: program.account,
    rootPath: program.path,
    registry: program.registry,
    link: program.link
  }
};

program
  .version('1.0.0')
  .option('-a, --account [account]', 'Npm account Name')
  .option('-p, --path [path]', 'Root project path')
  .option('-r, --registry [registry]', 'Npm registry')
  .option('-l, --link', 'Npm link dependencies')

program
  .command('list-projects')
  .description('List all available projects')
  .action( async () => {
    let projectBuilder = new ProjectBuilder(options(program));
    let projects = await projectBuilder.listProjects();
    Object.values(projects).forEach( (project) => {
      console.log(project);
    });

  });

program
  .command('install-project [project]')
  .description('Install npm modules and link them')
  .action( (project) => {
    if (!program.account) {
      throw new Error('No account selected')
    }
    let projectBuilder = new ProjectBuilder(options(program));
    if (project) {
      projectBuilder.buildSingleProject(project);
    } else {
      projectBuilder.buildAllProject();
    }
  });

program
  .command('publish-project [project]')
  .description('Publish npm modules and link them')
  .action( (project) => {
    if (!program.account) {
      throw new Error('No account selected')
    }
    let projectBuilder = new ProjectBuilder(options(program));
    if (project) {
      projectBuilder.publishSingleProject(project);
    } else {
      projectBuilder.publishAllProject();
    }
  });

program
  .command('projects-tree')
  .description('Display project tree')
  .action( async () => {
    let projectBuilder = new ProjectBuilder(options(program));
    let graph = await projectBuilder.buildProjectGraph();
    console.log(projectBuilder.treeView(graph));
  });

program
  .command('projects-graph')
  .description('Display project graph build order')
  .action( async () => {
    let projectBuilder = new ProjectBuilder(options(program));
    let graph = await projectBuilder.buildProjectGraph();
    try {
      graph.topologicalSort().forEach( (project) => {
        console.log(`${project}`);
      });
    } catch (e) {
      throw new Error('Cannot create a topological sort from dependency graph');
    }
  });

program
  .parse(process.argv);

if (program.args.length == 0) {
  program.outputHelp()
  process.exit(1);
}
