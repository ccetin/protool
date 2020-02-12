'use strict'

const spawn = require('child_process').spawn

class ShellWrapper {
  static execute(command) {
    return new Promise( (resolve, reject) => {
      if (!command) {
        return reject(new Error('Command required.'))
      }

      const child = spawn('sh', ['-c', command], { stdio: 'inherit' })

      const errorListener = (error) => {
        removeListeners()
        reject(error)
      }

      const closeListener = (code, signal) => {
        removeListeners()
        if (code === 0) {
          return resolve({ code: code })
        }
        if (code === null && signal) {
          return reject(new Error('Command sh -c <...> failed due to kill signal: ' + signal))
        }
        if (code === null && signal === null) {
          return reject(new Error('Command sh -c <...> failed due to an unknown error'))
        }
        return resolve({ code: code })
      }

      const removeListeners = () => {
        child.removeListener('error', errorListener)
        child.removeListener('close', closeListener)
      }

      child.on('error', errorListener)
      child.on('close', closeListener)
    })
  }

}

module.exports = ShellWrapper
