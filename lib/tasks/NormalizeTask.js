'use strict'

const path = require('path')
const BaseTask = require('./BaseTask')
const Explorer = require('../Explorer')
const Util = require('../Util')
const DependencyManager = require('../DependencyManager')

class NormalizeTask extends BaseTask {
  constructor(...args) {
    super(...args)
  }

  static getRelativeCacheDirectory({ workingDirectory, cacheDirectory }) {
    const relative =  path.relative(cacheDirectory, workingDirectory)
    const projectCacheDirectory = path.join(cacheDirectory, relative.replace(/\.\.\//g, ''))
    const packageFilename = path.join(projectCacheDirectory, 'package.json')
    return { projectCacheDirectory, packageFilename }
  }

  async execute(colors) {
    const { workingDirectory, paths, options, config, cacheDirectory, configFilename } = this.context
    const { scope: scopeOption, scopedOnly, strictVersion, updateModule, dryRun } = options
    const scope = scopeOption || config.scope
    const info = { workingDirectory, paths, scope, config, cacheDirectory, configFilename, scopedOnly, strictVersion, updateModule }
    await this.executeCommand(colors, dryRun, info)
    return 0
  }

  async executeCommand(colors, dryRun, { workingDirectory, paths, scope, config, cacheDirectory,
    configFilename, scopedOnly, strictVersion, updateModule }) {
    const { projectCacheDirectory, packageFilename } = NormalizeTask.getRelativeCacheDirectory({ workingDirectory, cacheDirectory })
    const isDirectory = await Util.isDirectory(projectCacheDirectory)
    if (!isDirectory && !dryRun) {
      Util.mkdir(projectCacheDirectory, true)
    }
    const isFile = packageFilename ? await Util.isFile(packageFilename) : false
    const deserializedDefinition = isFile ? await Util.readJsonFile(packageFilename) : null
    const name = path.basename(projectCacheDirectory)
    const packageDefinition = deserializedDefinition ? deserializedDefinition.json : { name, version: '1.0.0', dependencies: {} }
    const projects = await Explorer.listProjects(paths)
    const packages = Object.values(projects).map( (p) => { return p.packageDefinition })
    if (scopedOnly) {
      const configDefinition = config ? config : {}
      if (!configDefinition.dependencies) {
        configDefinition.dependencies = {}
      }
      DependencyManager.normalizeDependencies(configDefinition, packages, scope, !!scopedOnly, !!strictVersion, !!updateModule)
      if (!dryRun) {
        await Util.writeJsonFile(configFilename, configDefinition)
      }
    } else {
      DependencyManager.normalizeDependencies(packageDefinition, packages, scope, !!scopedOnly, !!strictVersion, !!updateModule)
      if (!dryRun) {
        await Util.writeJsonFile(packageFilename, packageDefinition)
      }
    }
    for (const p in projects) {
      const { filename: file, packageDefinition: definition } = projects[p]
      if (!dryRun) {
        await Util.writeJsonFile(file, definition)
      }
    }
  }

}

module.exports = NormalizeTask
