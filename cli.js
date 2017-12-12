#!/usr/bin/env node

const Promise = require('bluebird');
const program = require('commander');
const ProjectBuilder = require('./lib/projectBuilder');

program
  .version('1.0.0')
  .option('-a, --account [account]', 'Npm account Name')
  .option('-p, --path [path]', 'Root project path')
  .option('-t, --author [author]', 'Project author')
  .option('-i, --description [info]', 'Project description')
  .option('-r, --registry [registry]', 'Npm registry')
  .option('-l, --link', 'Npm link dependencies')

program
  .command('list-projects')
  .description('List all available projects')
  .action( () => {
    let projectBuilder = new ProjectBuilder({account: program.account, rootPath: program.path});
    projectBuilder.listProjects()
      .then( (projects) => {
        projects.forEach( (project) => {
          console.log(project);
        });
      });
  });

program
  .command('install-project [project]')
  .description('Install npm modules and link them')
  .action( (project) => {
    if (!program.account) {
      throw new Error('No account selected')
    }
    let projectBuilder = new ProjectBuilder({account: program.account, rootPath: program.path, registry: program.registry, link: program.link});
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
    let projectBuilder = new ProjectBuilder({account: program.account, rootPath: program.path, registry: program.registry, link: program.link});
    if (project) {
      projectBuilder.publishSingleProject(project);
    } else {
      projectBuilder.publishAllProject();
    }
  });

program
  .command('projects-tree')
  .description('Display project tree')
  .action( () => {
    let projectBuilder = new ProjectBuilder({account: program.account, rootPath: program.path});
    projectBuilder.buildProjectGraph()
      .then( (graph) => {
        console.log(projectBuilder.treeView(graph));
      });
  });

program
  .command('projects-graph')
  .description('Display project graph build order')
  .action( () => {
    let projectBuilder = new ProjectBuilder({account: program.account, rootPath: program.path});
    projectBuilder.buildProjectGraph()
      .then( (graph) => {
        try {
          graph.topologicalSort().forEach( (project) => {
            console.log(`${project}`);
          });
        } catch (e) {
          throw new Error('Cannot create a topological sort from dependency graph');
        }
      });
  });

program
  .parse(process.argv);

if (program.args.length == 0) {
  program.outputHelp()
  process.exit(1);
}
