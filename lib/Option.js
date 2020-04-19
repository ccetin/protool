'use strict'

const OPTIONS = {
  loggerLevel: {
    flags:       '-l, --logger-level <level>',
    description: 'set CLI log level (error, warn, [info], debug)',
    default:     'info'
  },
  npmLogLevel: {
    flags:       '-L, --npm-log-level <npmLogLevel>',
    description: 'set npm log level (http, warn, [silent])',
    default:     'warn'
  },
  filter: {
    flags:       '-f, --filter <filter>',
    description: 'filter with comma delimited list'
  },
  query: {
    flags:       '-q, --query <query>',
    description: 'query with comma delimited key:value list'
  },
  remote: {
    flags:       '-r, --remote <remote>',
    description: 'remote git service base url'
  },
  title: {
    flags:       '-t, --title <title>',
    description: 'name or title (based on context)'
  },
  group: {
    flags:       '-g, --group <group>',
    description: 'module group name'
  },
  path: {
    flags:       '-p, --path <path>',
    description: 'path to run command (CWD)'
  },
  registry: {
    flags:       '-R, --registry [registry]',
    description: 'NPM registry url',
    default:     'https://registry.npmjs.org'
  },
  scope: {
    flags:       '-s, --scope <scope>',
    description: 'scope name'
  },
  includeAll: {
    flags:       '-a, --include-all',
    description: 'include all dependencies in graph (not only scoped modules)'
  },
  global: {
    flags:       '-G, --global',
    description: 'install dependencies globally'
  },
  cache: {
    flags:       '-c, --cache',
    description: 'cache installed dependencies'
  },
  install: {
    flags:       '-I, --no-install',
    description: 'don\'t install dependencies',
    default:     true
  },
  dependenciesLink: {
    flags:       '-D, --no-dependencies-link',
    description: 'don\'t link scoped dependencies globally',
    default:     true
  },
  projectLink: {
    flags:       '-P, --no-project-link',
    description: 'don\'t link project globally',
    default:     true
  },
  rmLockfile: {
    flags:       '-F, --rm-lockfile',
    description: 'delete package-lock.json file',
    default:     false
  },
  scopedOnly: {
    flags:       '-S, --scoped-only',
    description: 'process scoped only dependencies'
  },
  strictVersion: {
    flags:       '-v, --strict-version',
    description: 'make dependencies version strict'
  },
  updateModule: {
    flags:       '-u, --update-module',
    description: 'update module if any dependency version change'
  }
}

class Option {

  static defaultOption({ flags, description, mandatory, defaultValue }) {
    const result = {}
    if (flags) {
      result.flags = flags
    }
    if (description) {
      result.description = description
    }
    if (mandatory !== undefined) {
      result.mandatory = mandatory
    }
    if (defaultValue !== undefined) {
      result.default = defaultValue
    }
    return result
  }

  static keys() {
    return Object.keys(OPTIONS)
  }

  static value(name, options) {
    const defaultValues = OPTIONS[name]
    if (defaultValues) {
      return Option.defaultOption(Object.assign(defaultValues, options))
    }
    return null
  }

}

module.exports = Option
