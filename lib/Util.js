'use strict'

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const util = require('util')
const glob = require('glob')

const fileStat = util.promisify(fs.stat)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const mkdir = util.promisify(fs.mkdir)

class Util {

  static async resolveBasedir(name, directory) {
    const list = []
    let folder = null
    while (!folder) {
      const filename = `${directory ? directory + '/' : ''}${list.join('/')}/${name}`
      const result = await this.findPattern(filename)
      if (result.length > 0) {
        return path.resolve(result[0])
      }
      list.push('..')
      const base = path.resolve(list.join('/'))
      if (base === '/') {
        break
      }
    }
    return null
  }

  static async resolveFiles(rootFolder, filename, limit = 5) {
    let files = []
    const list = []
    const directory = path.resolve(rootFolder)
    while (list.length < limit) {
      const name = `${directory}${list.length > 0 ? '/' + list.join('/') : ''}/${filename}`
      const result = await this.findPattern(name, { ignore: [ '**/node_modules/**' ] })
      if (result.length > 0) {
        files = files.concat( result.map(f => { return path.resolve(f) }))
      }
      list.push('*')
    }
    return files
  }

  static async findPattern(filePattern, options = {}) {
    return await new Promise((resolve, reject) => {
      glob(filePattern, options, (error, files) => {
        if (error) {
          reject(error)
        } else {
          resolve(files)
        }
      })
    })
  }

  static async isFile(filename) {
    try {
      const stat = await fileStat(filename)
      return stat.isFile()
    } catch (e) {
      if (e.code === 'ENOENT') {
        return false
      }
    }

  }

  static async isDirectory(directory) {
    try {
      const stat = await fileStat(directory)
      return stat.isDirectory()
    } catch (e) {
      if (e.code === 'ENOENT') {
        return false
      }
      throw e
    }
  }

  static async readJsonFile(filename) {
    const content = await readFile(filename, 'utf8')
    const json = JSON.parse(content)
    const hash = this.createHash(content)
    return { content, json, hash }
  }

  static async writeJsonFile(filename, data) {
    const json = typeof data === 'string' ? data : JSON.stringify(data, null, 4)
    await writeFile(filename, `${json}\n`)
  }

  static async mkdir(directory, recursive = false) {
    try {
      await mkdir(directory, { recursive })
      return true
    } catch (e) {
      return false
    }
  }

  static createHash(data, algorithm = 'sha256') {
    const hash = crypto.createHash(algorithm)
    hash.update(data)
    return hash.digest('hex')
  }

  static isScoped(dependency, scope) {
    return scope && dependency && dependency.startsWith(`@${scope}/`)
  }

}

module.exports = Util
