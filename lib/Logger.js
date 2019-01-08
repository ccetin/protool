'use strict'

const EventEmitter     = require('events')

const LOGGER_LEVEL = {
  'fatal': 60,
  'error': 50,
  'warn':  40,
  'info':  30,
  'debug': 20,
  'trace': 10
}

class Logger extends EventEmitter {
  constructor(options) {
    super()
    const opts = options || {}
    this.currentLevel = opts.level || 'info'
  }

  get level() {
    return this.currentLevel
  }

  get currentThreshold() {
    return LOGGER_LEVEL[this.level]
  }

  print(level, ...args) {
    const levelThreshold = LOGGER_LEVEL[level]
    if (levelThreshold >= this.currentThreshold) {
      console.log(...args) //eslint-disable-line
    }
  }

  trace(...args) {
    return this.print('trace', ...args)
  }

  debug(...args) {
    return this.print('debug', ...args)
  }

  info(...args) {
    return this.print('info', ...args)
  }

  warn(...args) {
    return this.print('warn', ...args)
  }

  error(...args) {
    return this.print('error', ...args)
  }

  fatal(...args) {
    return this.print('fatal', ...args)
  }

}

module.exports = Logger
