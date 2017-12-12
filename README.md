# Project packaging tool without using npm
```
node cli.js --help

  Usage: cli [options] [command]


  Options:

    -V, --version              output the version number
    -a, --account [account]    Npm account Name
    -p, --path [path]          Root project path
    -t, --author [author]      Project author
    -i, --description [info]   Project description
    -r, --registry [registry]  Npm registry
    -l, --link                 Npm link dependencies
    -h, --help                 output usage information


  Commands:

    list-projects              List all available projects
    install-project [project]  Install npm modules and link them
    publish-project [project]  Publish npm modules and link them
    projects-tree              Display project tree
    projects-graph             Display project graph build order
```
