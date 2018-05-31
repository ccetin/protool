## Node project helper tools


```
Usage: project-explorer [options] [command]

Options:

  -V, --version            output the version number
  -a, --account [account]  Npm account name (@scope)
  -p, --path [path]        Root project path
  -h, --help               output usage information

Commands:

  list                     List all available projects
  tree                     Display project tree
  graph                    Display project graph build order
```

```
Usage: project-builder [options] [command]

Options:

  -V, --version              output the version number
  -a, --account [account]    Npm account name (@scope)
  -p, --path [path]          Root project path
  -r, --registry [registry]  Npm registry (default: https://registry.npmjs.org)
  -l, --link                 Npm link dependencies
  -h, --help                 output usage information

Commands:

  install [project]          Install npm modules and optionally link them
```

```
Usage: project-publisher [options] [command]

Options:

  -V, --version              output the version number
  -a, --account [account]    Npm account name (@scope)
  -p, --path [path]          Root project path
  -r, --registry [registry]  Npm registry (default: https://registry.npmjs.org)
  -l, --link                 Npm link dependencies
  -h, --help                 output usage information

Commands:

  publish [project]          Publish npm modules
```
