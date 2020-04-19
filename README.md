## Node project helper tools


```
Usage: projectify | proj | pro [options] [command]

Options:
  -V, --version                      output the version number
  -L, --npm-log-level <npmLogLevel>  set npm log level (http, warn, [silent])
  -l, --logger-level <level>         set CLI log level (error, warn, [info], debug)
  -p, --path <path>                  path to run command (CWD)
  -f, --filter <filter>              filter with comma delimited list
  -h, --help                         display help for command

Commands:
  init [options]                     initialize project
  config                             see current project config value(s) or set new value
  clone [options]                    clone repository(ies) from git source
  status                             show repository status
  sync                               sync repositories with remote [master]
  exec <script>                      execute command for all or selected repositories
  run <script>                       run npm script for all or selected repositories
  normalize [options]                normalize package.json with latest version for all modules
  clean [options]                    remove all the dependencies and undo module linking in node_modules
  bootstrap [options]                install all the dependencies and create symlinks to work locally
  update                             update dependencies for all or selected modules
  publish [options]                  publish all or selected modules
  list [options]                     list project modules
  order [options]                    show project module topological order
  tree [options]                     show project module tree
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
  '@incubator/*':
    access: $all
    publish: $all
  '@humanics/*':
    access: $all
    publish: $authenticated
    proxy: npmjs
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
