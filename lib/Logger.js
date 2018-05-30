'use strict'

const bunyan = require('bunyan')
const log = bunyan.createLogger({ name: 'build-tools' })

module.exports = {
  log
}
