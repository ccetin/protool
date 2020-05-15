'use strict'

const ShellTask = require('./ShellTask')
const Util = require('../Util')

class CloneTask extends ShellTask {
  constructor(...args) {
    super(...args)
  }

  validate() {
    const { workingDirectory, options, config } = this.context
    const { remote: remoteGit, query } = options
    const remote = remoteGit || config.remote
    let result = true
    if (!workingDirectory || !remote || !query) {
      result = false
    }
    return result
  }

  async execute(colors) {
    const { workingDirectory: directory, options, config } = this.context
    const { remote: remoteGit, group, query, dryRun } = options
    const remote = remoteGit || config.remote
    const repositories = query ? query.split(',') : []

    for (const repository of repositories) {
      const url = `${remote}/${repository}.git`
      const projectPath = group ? `${directory}/${group}/${repository}` : `${directory}/${repository}`
      const configFile = `${projectPath}/.git/config`
      const configFileExists = await Util.isFile(configFile)
      await this.executeCommand(colors, dryRun, { directory, repository, url, projectPath, configFile, configFileExists })
    }
  }

  buildCommand({ directory, repository, url , projectPath, configFile, configFileExists}) {
    if (directory) {
      if (configFileExists) {
        return [
          `URL=$(cat ${configFile} | grep url | awk '{ gsub(",",""); print $3 }')`,
          `echo "[INFO]: Repository: ${repository} already cloned from $URL"`
        ].join(' && ')
      } else {
        const regex = /(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|#[-\d\w._]+?)$/
        if (regex.test(url)) {
          return [
            `mkdir -p ${projectPath}`,
            `cd ${projectPath}`,
            `git clone ${url} .`
          ].join(' && ')
        }
      }
    }
    return ''
  }

}

module.exports = CloneTask
