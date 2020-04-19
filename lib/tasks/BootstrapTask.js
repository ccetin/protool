'use strict'

const path = require('path')
const ShellTask = require('./ShellTask')

class BootstrapTask extends ShellTask {
  constructor(...args) {
    super(...args)
  }

  buildCommand({ directory, dependencies, npmLogLevel }) {
    if (directory) {
      const dependenciesLink = this.getOption('dependenciesLink')
      const projectLink = this.getOption('projectLink')
      const install = this.getOption('install')
      const inGlobal = this.getOption('global')
      const cache = this.getOption('cache')
      const { scopedDependencies, otherDependencies } = dependencies
      const commands = [`cd ${directory}`]
      if (otherDependencies && otherDependencies.length > 0 && install) {
        const cmd = this.installExternalDependencies({ scopedDependencies, npmLogLevel, cache, directory })
        commands.push(cmd)
      }
      if (scopedDependencies && scopedDependencies.length > 0 && dependenciesLink) {
        if (inGlobal) {
          const cmd = this.installGlobalDependencies({ scopedDependencies, npmLogLevel })
          commands.push(cmd)
        } else {
          const cmd = this.installSymlinkedDependencies({ directory, scopedDependencies })
          commands.push(cmd)
        }
      }
      if (projectLink) {
        commands.push(`npm --loglevel ${npmLogLevel} link`)
      }
      return commands.join(' && ')
    }
    return ''
  }

  installExternalDependencies({ otherDependencies, npmLogLevel }) {
    return `npm --loglevel ${npmLogLevel} install ${otherDependencies.join(' ')}`
  }

  installGlobalDependencies({ scopedDependencies, npmLogLevel }) {
    const list = scopedDependencies.map( (d) => {
      return d.packageName
    })
    return `npm --loglevel ${npmLogLevel} link ${list.join(' ')}`
  }

  installSymlinkedDependencies({ directory, scopedDependencies }) {
    const commands = []
    const scopes = new Set()
    const list = scopedDependencies.map( (d) => {
      const relativePath =  path.relative(directory, d.directory)
      const [ scope, name ] = d.packageName.split('/')
      if (name) {
        scopes.add(scope)
      }
      return { relativePath, scope, name }
    })
    commands.push('mkdir -p node_modules')
    commands.push('cd node_modules')
    for (const s of scopes) {
      commands.push(`mkdir -p "${s}"`)
    }
    for (const m of list) {
      const { relativePath, scope, name } = m
      if (name) {
        commands.push(`cd "${directory}/node_modules/${scope}" && ln -s ../../${relativePath} ${name}`)
      } else {
        commands.push(`cd "${directory}/node_modules" && ln -s ../${relativePath} ${scope} `)
      }
    }
    return commands.join(' && ')
  }

}

module.exports = BootstrapTask
