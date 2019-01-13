'use strict'

const util = require('util')
const fs = require('fs')
const doctrine = require('doctrine')
const yaml = require('js-yaml')
const glob = require('glob')

const BaseProjectTask = require('./BaseProjectTask')

const CUSTOM_TAGS = ['oas', 'components', 'paths', 'security', 'controller', 'service', 'entity']

class ApiBuilder extends BaseProjectTask {
  constructor(options) {
    super(options)
  }

  get taskName() {
    return 'API'
  }

  async parseJsdoc(file) {
    const readFile = util.promisify(fs.readFile)
    const docs = []
    const content = await readFile(file, { encoding: 'utf8' })
    const results = content.match(/\/\*\*([\s\S]*?)\*\//gm)
    if (results) {
      for (let comment of results) {
        const doc = doctrine.parse(comment, { unwrap: true })
        doc.file = file
        docs.push(doc)
      }
    }
    return docs
  }

  extractCustomJsdoc(docs) {
    var list = []
    for (const doc of docs) {
      for (const tag of doc.tags) {
        if (CUSTOM_TAGS.indexOf(tag.title) > -1) {
          let json = null
          try {
            json = yaml.safeLoad(tag.description)
          } catch (e) {
            json = tag.description
          }
          list.push({ type: tag.title, json, file: doc.file })
        }
      }
    }
    return list
  }

  async extractApi(projectPath) {
    const pattern = `${projectPath}/**/*.js`
    const files = await new Promise( (resolve, reject) => {
      glob(pattern, { ignore: 'node_modules' }, (error, files) => {
        if (error) {
          reject(error)
        }
        resolve(files)
      })
    })
    let results = []
    for (const file of files) {
      const docs = await this.parseJsdoc(file)
      const customDocs = this.extractCustomJsdoc(docs)
      results = results.concat(customDocs)
    }
    return results
  }

  async extractSpecification() {
    try {
      let results = []
      const projects = await this.explorer.orderedProjects()
      for (const project of projects) {
        const result = await this.extractApi(project.projectPath)
        results = results.concat(result)
      }
      const specification = this.buildSpecification(results)
      return specification
    } catch (e) {
      this.log.error(e.message)
    }
  }

  buildSpecification(fragments) {
    const result = {
      oas: {
        paths:      {},
        components: {},
        security:   {}
      },
      api: {
        controllers: {},
        services:    {},
        entities:    {}
      }
    }
    for (const fragment of fragments) {
      if (fragment.type === 'oas') {
        for (const type of Object.keys(fragment.json)) {
          if (['paths', 'components', 'security'].indexOf(type) > -1) {
            for (const key of Object.keys(fragment.json[type])) {
              result.oas[type][key] = fragment.json[type][key]
            }
          }
        }
      } else if (fragment.type === 'paths') {
        for (const key of Object.keys(fragment.json)) {
          result.oas.paths[key] = fragment.json[key]
        }
      } else if (fragment.type === 'components') {
        for (const key of Object.keys(fragment.json)) {
          result.oas.components[key] = fragment.json[key]
        }
      } else if (fragment.type === 'security') {
        for (const key of Object.keys(fragment.json)) {
          result.oas.security[key] = fragment.json[key]
        }
      } else if (fragment.type === 'controller') {
        result.api.controllers[fragment.json] = fragment.file
      } else if (fragment.type === 'service') {
        result.api.services[fragment.json] = fragment.file
      } else if (fragment.type === 'entity') {
        result.api.entities[fragment.json] = fragment.file
      }
    }
    return result
  }

}

module.exports = ApiBuilder
