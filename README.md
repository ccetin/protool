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
  -h, --help                 output usage information

Commands:

  publish [project]          Publish npm modules
```

## Working with Verdaccio for local development

1. Pull docker image:
```
docker pull verdaccio/verdaccio
mkdir -p /Users/...workdir.../etc/verdaccio/{conf,plugins}
mkdir -p /Users/...workdir.../var/verdaccio/storage
docker run -it --name verdaccio -p 4873:4873 \
  -v /Users/...workdir.../etc/verdaccio/conf:/verdaccio/conf \
  -v /Users/...workdir.../var/verdaccio/storage:/verdaccio/storage \
  -v /Users/...workdir.../etc/verdaccio/plugins:/verdaccio/plugins \
  verdaccio/verdaccio
```

2. Create config.yaml
```
storage: /verdaccio/storage
auth:
  htpasswd:
    file: /verdaccio/conf/htpasswd
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
packages:
  '@*/*':
    access: $all
    publish: $authenticated
    proxy: npmjs
  '**':
    access: $all
    proxy: npmjs
logs:
  - {type: stdout, format: pretty, level: http}
publish:
  allow_offline: true
web:
  enable: true
  title: Development NPM Server
  logo:
  scope:
```

3. Add following to ~/.bash_profile
```
vpm() {
  npm --registry http://localhost:4873 $@
}
```
