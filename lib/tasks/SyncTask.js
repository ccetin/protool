'use strict'

const ShellTask = require('./ShellTask')

class SyncTask extends ShellTask {
  constructor(...args) {
    super(...args)
    this.verbose = true
  }

  buildCommand({ directory }) {
    if (directory) {
      const checkoutMaster = [
        '[ -z "$(git status --untracked-files=no --porcelain 2> /dev/null)" ]',
        'git checkout master',
        'git pull origin master'
      ]
      const notClean = [
        '[ -n "$(git status --untracked-files=no --porcelain 2> /dev/null)" ]',
        'BRANCH=$(git branch --no-color 2> /dev/null | sed -e \'/^[^*]/d\' -e \'s/* \\(.*\\)/\\1/\')',
        'echo "[WARNING]: $BRANCH not clean"'
      ]
      return `cd ${directory}; ${checkoutMaster.join(' && ')}; ${notClean.join(' && ')}`
    }
    return ''
  }

}

module.exports = SyncTask
