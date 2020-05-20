#!/usr/bin/env node

const Cli = require('../lib/Cli')
const Option = require('../lib/Option')
const InitTask = require('../lib/tasks/InitTask')
const ConfigListTask = require('../lib/tasks/ConfigListTask')
const ConfigGetTask = require('../lib/tasks/ConfigGetTask')
const ConfigSetTask = require('../lib/tasks/ConfigSetTask')
const CloneTask = require('../lib/tasks/CloneTask')
const StatusTask = require('../lib/tasks/StatusTask')
const SyncTask = require('../lib/tasks/SyncTask')
const ExecTask = require('../lib/tasks/ExecTask')
const RunTask = require('../lib/tasks/RunTask')
const NormalizeTask = require('../lib/tasks/NormalizeTask')
const InstallTask = require('../lib/tasks/InstallTask')
const DeleteTask = require('../lib/tasks/DeleteTask')
const CleanTask = require('../lib/tasks/CleanTask')
const BootstrapTask = require('../lib/tasks/BootstrapTask')
const UpdateTask = require('../lib/tasks/UpdateTask')
const PublishTask = require('../lib/tasks/PublishTask')
const ListTask = require('../lib/tasks/ListTask')
const OrderTask = require('../lib/tasks/OrderTask')
const TreeTask = require('../lib/tasks/TreeTask')

const params = {
  main:    (...args) => { Cli.printUsage(...args) },
  options: [
    Option.value('dryRun'), Option.value('npmLogLevel'), Option.value('loggerLevel'),
    Option.value('path'), Option.value('filter')
  ],
  commands: [
    {
      name:        'init',
      description: 'initialize project',
      action:      InitTask.action(),
      options:     [
        Option.value('title'), Option.value('scope'), Option.value('remote'),
        Option.value('group')
      ]
    },
    {
      name:        'config',
      description: 'see current project config value(s) or set new value',
      action:      (...args) => { Cli.printUsage(...args) },
      commands:    [
        {
          name:        'list',
          description: 'list project config',
          action:      ConfigListTask.action()
        },
        {
          name:        'get <key>',
          description: 'get project config value by key',
          action:      ConfigGetTask.action()
        },
        {
          name:        'set <key> <value>',
          description: 'set project config key with new value',
          action:      ConfigSetTask.action()
        }
      ]
    },
    {
      name:        'clone',
      description: 'clone repository(ies) from git source',
      action:      CloneTask.action(),
      options:     [ Option.value('remote'), Option.value('group'), Option.value('query') ]
    },
    {
      name:        'status',
      description: 'show repository status',
      action:      StatusTask.action()
    },
    {
      name:        'sync',
      description: 'sync repositories with remote [master]',
      action:      SyncTask.action()
    },
    {
      name:        'exec <script>',
      description: 'execute command for all or selected repositories',
      action:      ExecTask.action()
    },
    {
      name:        'run <script>',
      description: 'run npm script for all or selected repositories',
      action:      RunTask.action()
    },
    {
      name:        'normalize',
      description: 'normalize all dependencies to latest version for all modules',
      action:      NormalizeTask.action(),
      options:     [ Option.value('scopedOnly'), Option.value('strictVersion'),
        Option.value('updateModule') ],
      commands: [
        {
          name:        'install',
          description: 'install cached dependencies',
          action:      InstallTask.action()
        },
        {
          name:        'delete',
          description: 'delete cached dependencies',
          action:      DeleteTask.action()
        }
      ]
    },
    {
      name:        'clean',
      description: 'remove all the dependencies and undo module linking in node_modules',
      action:      CleanTask.action(),
      options:     [
        Option.value('scope'), Option.value('rmLockfile'), Option.value('global'), Option.value('includeAll')
      ]
    },
    {
      name:        'bootstrap',
      description: 'install all the dependencies and create symlinks to work locally',
      action:      BootstrapTask.action(),
      options:     [
        Option.value('scope'), Option.value('dependenciesLink'), Option.value('projectLink'),
        Option.value('install'), Option.value('cache'), Option.value('global'), Option.value('includeAll')
      ]
    },
    {
      name:        'update',
      description: 'update dependencies for all or selected modules',
      action:      UpdateTask.action()
    },
    {
      name:        'publish',
      description: 'publish all or selected modules',
      action:      PublishTask.action(),
      options:     [
        Option.value('scope')
      ]
    },
    {
      name:        'list',
      description: 'list project modules',
      action:      ListTask.action(),
      options:     [
        Option.value('scope'), Option.value('includeAll')
      ]
    },
    {
      name:        'order',
      description: 'show project module topological order',
      action:      OrderTask.action(),
      options:     [
        Option.value('scope'), Option.value('includeAll')
      ]
    },
    {
      name:        'tree',
      description: 'show project module tree',
      action:      TreeTask.action(),
      options:     [
        Option.value('scope'), Option.value('includeAll')
      ]
    }
  ]
}

Cli.run(params)
