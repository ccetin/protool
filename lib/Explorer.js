'use strict'

const path = require('path')
const Util = require('./Util')

const Digraph = require('./Digraph')

class Explorer {

  static async listProjects(directories = [], filters = [], target = 'package.json') {
    let files = []
    for (const d of directories) {
      const list = await Util.resolveFiles(d, target)
      files = files.concat(list)
    }
    const cache = new Set()
    const list = files
      .filter( (f) => {
        return filters.length === 0
          || f.match(new RegExp(`.*\\/(${filters.join('|')})\\/.*`))
      })
      .filter( (f) => {
        const flag = !cache.has(f)
        cache.add(f)
        return flag
      })
      .map( (filename) => {
        const directory = path.dirname(filename)
        const projectName = path.basename(directory)
        return { directory, filename, projectName }
      })
      .sort( (a, b) => { return a.directory < b.directory })
    const projects = {}
    for (const p of list) {
      const deserializedPackage = await Util.readJsonFile(p.filename)
      const packageDefinition = deserializedPackage.json
      const { name: packageName, version } = packageDefinition
      projects[packageName] = Object.assign({ packageName, version, packageDefinition }, p)
    }
    return projects
  }

  static getDependencies(packageDefinition, excludes = []) {
    const dependencies = []
      .concat(packageDefinition.dependencies)
      .concat(packageDefinition.devDependencies)
      .filter( (item) => { return !!item })
      .map( (item) => { return Object.keys(item) })
      .flat()
      .filter( (item) => { return excludes.indexOf(item) === -1 })
    return [...new Set(dependencies)]
  }

  static async buildProjectGraph(directories, scope, includeAll, filter, target) {
    const graph = new Digraph()
    const mapping = {}
    const projects = await Explorer.listProjects(directories, filter, target)
    for (const name in projects) {
      const project = projects[name]
      graph.addVertex(name, project)
    }
    for (const name of graph.vertices()) {
      const lib = graph.getData(name)
      const { packageDefinition, filename } = lib
      const dependencies = Explorer.getDependencies(packageDefinition)
      if (Util.isScoped(name, scope)) {
        mapping[name] = filename
        for (const dependency of dependencies) {
          if (Util.isScoped(dependency, scope)) {
            graph.addEdge(name, dependency)
          }
        }
      } else if (!scope || includeAll) {
        mapping[name] = filename
        for (const dependency of dependencies) {
          if (projects[dependency]) {
            graph.addEdge(name, dependency)
          }
        }
      }
    }
    return { graph, mapping }
  }

  static async orderedProjects(directories, scope, includeAll, filter, target) {
    const { graph, mapping } = await Explorer.buildProjectGraph(directories, scope, includeAll, filter, target)
    const topologicalOrder = graph.topologicalSort()
    const list = topologicalOrder
      .filter( (key) => { return !!mapping[key] })
      .map( (key) => {
        const lib = graph.getData(key)
        const { packageDefinition } = lib
        const adjacentList = graph.adjacentList(key)
        const scopedDependencies = adjacentList
          .map( (packageName) => {
            const data = graph.getData(packageName)
            const { directory } = data || {}
            return { packageName, directory }
          })
          .filter( (o) => { return !!o.directory })
        const otherDependencies = Explorer.getDependencies(packageDefinition, adjacentList)
        const dependencies = { scopedDependencies, otherDependencies }
        lib.dependencies = dependencies
        return lib
      })
    return list
  }

  static treeView(graph, mapping, prefix = '') {
    const model = { nodes: [] }
    const topologicalOrder = graph.topologicalSort()
    const list = topologicalOrder.filter( (key) => { return !!mapping[key] })
    for (const u of list) {
      const udata = graph.getData(u)
      const node = {}
      node.label = `${u}@${udata ? udata.version : ''}`
      node.nodes = []
      for (const w of graph.adjacentList(u)) {
        const wdata = graph.getData(u)
        node.nodes.push(`${w}@${wdata ? wdata.version : ''}`)
      }
      model.nodes.push(node)
    }
    return Explorer.buildTree(model, prefix)
  }

  static buildTree(model, prefix) {
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
        return prefix
              + (last ? '└─' : '├─')
              + (more ? '┬ ' : '─ ')
              + Explorer.buildTree(node, _prefix).slice(prefix.length + 2)
      }).join('')
  }

}

module.exports = Explorer
