'use strict';

const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const Digraph = require('./graph');
const Shell = require('./shell');

class ProjectBuilder {
  constructor(options) {
    this.options = options || {};
    this.account = this.options.account || '';
    this.rootPath = path.resolve(this.options.rootPath || path.resolve(process.env.PWD, '..'));
    this.registry = this.options.registry || null;
    this.link = this.options.link === undefined ? false : this.options.link;
    this.graph = new Digraph();
    this.mapping = {};
  }

  async listProjects() {
    let projects = await fs.readdirAsync(this.rootPath).filter( async (file) => {
      let projectPath = path.join(this.rootPath, file, 'package.json');
      try {
        let stat = await fs.statAsync(projectPath);
        return stat.isFile();
      } catch(e) {
        return false;
      }
    });
    return projects.reduce( (result, project) => {
      result[project] = path.join(this.rootPath, project);
      return result;
    }, {});
  }

  async buildProjectGraph() {
    let projects = await this.listProjects();
    Object.values(projects).map( (folder) => {
        return path.join(folder, 'package.json')
      })
      .forEach( (file) => {
        let packageDetail = require(file);
        if (this.account && packageDetail.name.startsWith(`${this.account}/`)) {
          this.mapping[packageDetail.name] = file;
          this.graph.addVertex(packageDetail.name);
          if (packageDetail.dependencies) {
            Object.keys(packageDetail.dependencies).forEach( (dependency) => {
              if (dependency.startsWith(`${this.account}/`)) {
                this.graph.addEdge(packageDetail.name, dependency);
              }
            });
          }
        } else if (!this.account) {
          this.mapping[packageDetail.name] = file;
          this.graph.addVertex(packageDetail.name);
          if (packageDetail.dependencies) {
            Object.keys(packageDetail.dependencies).forEach( (dependency) => {
              if (projects[dependency]) {
                this.graph.addEdge(packageDetail.name, dependency);
              }
            });
          }
        }
      });
    return this.graph;
  }

  async getCommandsWithOrder(command) {
    await this.buildProjectGraph()
    let topologicalOrder = [];
    try {
      topologicalOrder = this.graph.topologicalSort();
    } catch (e) {
      throw new Error('Cannot create a topological sort from dependency graph');
    }

    return topologicalOrder.filter( (key) => {
      return !!this.mapping[key];
    })
      .map( (key) => {
        let file = this.mapping[key];
        let projectPath = path.dirname(file);
        let dependencies = this.graph.adjacentList(key);
        return command(projectPath, dependencies);
      });
  }

  async getProjectBuildOrder() {
    return await this.getCommandsWithOrder( (projectPath, dependencies) => {
      this.buildCommand(projectPath, dependencies);
    });
  }

  async getProjectPublishOrder() {
    return await this.getCommandsWithOrder( (projectPath, dependencies) => {
      this.publishCommand(projectPath);
    });
  }

  buildCommand(projectPath, dependencies) {
    let commands = [`cd ${projectPath}`, 'rm -rf node_modules'];
    if (dependencies && dependencies.length > 0 && this.link) {
      commands.push(`npm --loglevel warn link ${dependencies.join(' ')}`);
    }
    commands.push('npm --loglevel warn install');
    if (this.link) {
      commands.push('npm --loglevel warn link');
    }
    return commands.join(' && ');
  }

  publishCommand(projectPath) {
    let commands = [`cd ${projectPath}`, 'rm -rf node_modules'];
    commands.push('npm --loglevel warn install');
    commands.push(`npm --loglevel warn publish ${this.registry ? '--registry=' + this.registry : ''} .`);
    return commands.join(' && ');
  }

  async buildSingleProject(project) {
    let projectPath = path.resolve(this.rootPath, project);
    let file = path.join(projectPath, 'package.json');
    try {
      let stat = await fs.statAsync(file);
      let packageDetail = require(file);
      let dependencies = [];
      if (packageDetail.dependencies) {
        let projects = await this.listProjects();
        Object.keys(packageDetail.dependencies).forEach( (dependency) => {
          if (this.account && dependency.startsWith(`${this.account}/`)
            || !this.account && !!projects[dependency]) {
            dependencies.push(dependency);
          }
        });
      }
      let command = this.buildCommand(projectPath, dependencies);

      console.log(`Running build command for -> ${command}`);
      return await Shell.execute(command);
    } catch(e) {
      return false;
    }
  }

  async publishSingleProject(project) {
    let projectPath = path.resolve(this.rootPath, project);
    let file = path.join(projectPath, 'package.json');
    try {
      let stat = await fs.statAsync(file);
      let command = this.publishCommand(projectPath);

      console.log(`Running publish command for -> ${command}`);
      return await Shell.execute(command);
    } catch(e) {
      return false;
    }
  }

  async buildAllProject() {
    let commands = await this.getProjectBuildOrder();
    commands.forEach( async (command) => {
      console.log(`Running build command for -> ${command}`);
      return await Shell.execute(command);
    });
  }

  async publishAllProject() {
    let commands = await this.getProjectPublishOrder();
    commands.forEach( async (command) => {
      console.log(`Running publish command for -> ${command}`);
      return await Shell.execute(command);
    });
  }

  treeView(graph) {
    let prefix = this.options.prefix || '';
    let model = { nodes: [] };

    graph.topologicalSort().forEach( (u) => {
      let _node = {};
      _node.label = u;
      _node.nodes = [];
      graph.adjacentList(u).forEach( (w) => {
        _node.nodes.push(w);
      });
      model.nodes.push(_node);
    });
    return this.buildTree(model, prefix);
  }

  buildTree(model, prefix) {
    model = typeof model === 'string' ? { label : model } : model;
    let nodes = model.nodes || [];
    let lines = (model.label || '').split('\n');
    let splitter = '\n' + prefix + (nodes.length ? '│ ' : '  ');

    return prefix
      + lines.join(splitter) + '\n'
      + nodes.map( (node, index) => {
          let last = index === nodes.length - 1;
          let more = node.nodes && node.nodes.length > 0;
          let _prefix = prefix + (last ? '  ' : '│ ');

          return prefix + (last ? '└─' : '├─') + (more ? '┬ ' : '─ ')
              + this.buildTree(node, _prefix).slice(prefix.length + 2);
        }).join('');
  }

}

module.exports = ProjectBuilder;
