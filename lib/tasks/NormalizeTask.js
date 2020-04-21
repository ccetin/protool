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

  async execute() {
    const { workingDirectory, options, config, cacheDirectory, configFilename } = this.context
    const { scope: scopeOption, scopedOnly, strictVersion, updateModule } = options
    const scope = scopeOption || config.scope
    await this.normalize({ workingDirectory, scope, config, cacheDirectory, configFilename,
      scopedOnly, strictVersion, updateModule })
  }

  async normalize({ workingDirectory, scope, config, cacheDirectory,
    configFilename, scopedOnly, strictVersion, updateModule }) {
    const { projectCacheDirectory, packageFilename } = NormalizeTask.getRelativeCacheDirectory({ workingDirectory, cacheDirectory })
    const isDirectory = await Util.isDirectory(projectCacheDirectory)
    if (!isDirectory) {
      Util.mkdir(projectCacheDirectory, true)
    }
    const isFile = packageFilename ? await Util.isFile(packageFilename) : false
    const deserializedDefinition = isFile ? await Util.readJsonFile(packageFilename) : null
    const name = path.basename(projectCacheDirectory)
    const packageDefinition = deserializedDefinition ? deserializedDefinition.json : { name, version: '1.0.0', dependencies: {} }
    const projects = await Explorer.listProjects(workingDirectory)
    const packages = Object.values(projects).map( (p) => { return p.packageDefinition })
    if (scopedOnly) {
      const configDefinition = config ? config : {}
      if (!configDefinition.dependencies) {
        configDefinition.dependencies = {}
      }
      DependencyManager.normalizeDependencies(configDefinition, packages, scope, !!scopedOnly, !!strictVersion, !!updateModule)
      await Util.writeJsonFile(configFilename, configDefinition)
    } else {
      DependencyManager.normalizeDependencies(packageDefinition, packages, scope, !!scopedOnly, !!strictVersion, !!updateModule)
      await Util.writeJsonFile(packageFilename, packageDefinition)
    }
    for (const p in projects) {
      const { filename: file, packageDefinition: definition } = projects[p]
      await Util.writeJsonFile(file, definition)
    }
  }

}

module.exports = NormalizeTask
