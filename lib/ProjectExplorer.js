'use strict'

const util = require('util')
const path = require('path')
const fs = require('fs')

const Digraph = require('./Digraph')

class ProjectExplorer {
  constructor(options) {
    const opts = Object.assign({}, options)
    this.account = opts.account || ''
    this.prefix = opts.prefix || ''
    this.rootPath = path.resolve(opts.path)
  }

  async listProjects() {
    const statAsync = util.promisify(fs.stat)
    const readdirAsync = util.promisify(fs.readdir)
    const folders = await readdirAsync(this.rootPath)
    const projects = []
    for (const item of folders) {
      const projectPath = path.join(this.rootPath, item, 'package.json')
      try {
        const stat = await statAsync(projectPath)
        if (stat.isFile()) {
          projects.push(item)
        }
      } catch (e) {} // eslint-disable-line
    }
    return projects.reduce( (result, project) => {
      result[project] = path.join(this.rootPath, project)
      return result
    }, {})
  }

  async buildProjectGraph() {
    const graph = new Digraph()
    const mapping = {}
    const projects = await this.listProjects()
    const files = Object.values(projects).map( (folder) => { return path.join(folder, 'package.json') })
    for (const file of files) {
      const packageDetail = require(file)
      graph.addVertex(packageDetail.name, { packageDetail, file })
    }
    for (const name of graph.vertices()) {
      const packageDetail = graph.getData(name).packageDetail
      const file = graph.getData(name).file
      if (this.account && name.startsWith(`${this.account}/`)) {
        mapping[name] = file
        if (packageDetail.dependencies) {
          for (const dependency in packageDetail.dependencies) {
            if (dependency.startsWith(`${this.account}/`)) {
              graph.addEdge(name, dependency)
            }
          }
        }
      } else if (!this.account) {
        mapping[name] = file
        if (packageDetail.dependencies) {
          for (const dependency in packageDetail.dependencies) {
            if (projects[dependency]) {
              graph.addEdge(name, dependency)
            }
          }
        }
      }
    }
    return { graph, mapping }
  }

  async orderedProjects() {
    const { graph, mapping } = await this.buildProjectGraph()
    try {
      const topologicalOrder = graph.topologicalSort()
      return topologicalOrder.filter( (key) => {
        return !!mapping[key]
      })
        .map( (key) => {
          const version = graph.getData(key).packageDetail.version
          const file = mapping[key]
          const projectPath = path.dirname(file)
          return { projectPath, version }
        })
    } catch (e) {
      this.log.error(e.message)
    }
  }

  async orderedProjectCommands(command) {
    const { graph, mapping } = await this.buildProjectGraph()
    try {
      const topologicalOrder = graph.topologicalSort()
      return topologicalOrder.filter( (key) => {
        return !!mapping[key]
      })
        .map( (key) => {
          const version = graph.getData(key)
          const file = mapping[key]
          const projectPath = path.dirname(file)
          const dependencies = graph.adjacentList(key)
          return command({ projectPath, dependencies, version })
        })
    } catch (e) {
      this.log.error(e.message)
    }
  }

  treeView(graph) {
    const prefix = this.prefix
    const model = { nodes: [] }

    for (const u of graph.topologicalSort()) {
      const _node = {}
      _node.label = `${u}@${graph.getData(u).packageDetail.version}`
      _node.nodes = []
      for (const w of graph.adjacentList(u)) {
        _node.nodes.push(`${w}@${graph.getData(w).packageDetail.version}`)
      }
      model.nodes.push(_node)
    }
    return this.buildTree(model, prefix)
  }

  buildTree(model, prefix) {
    model = typeof model === 'string' ? { label: model } : model
    const nodes = model.nodes || []
    const lines = (model.label || '').split('\n')
    const splitter = '\n' + prefix + (nodes.length ? '│ ' : '  ')

    return prefix
      + lines.join(splitter) + '\n'
      + nodes.map( (node, index) => {
        const last = index === nodes.length - 1
        const more = node.nodes && node.nodes.length > 0
        const _prefix = prefix + (last ? '  ' : '│ ')

        return prefix + (last ? '└─' : '├─') + (more ? '┬ ' : '─ ')
              + this.buildTree(node, _prefix).slice(prefix.length + 2)
      }).join('')
  }

}

module.exports = ProjectExplorer
