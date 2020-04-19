'use strict'

const semver = require('semver')

class DependencyManager {

  static normalizeDependencies(masterPackageDefinition, packages = [], scope = '', scopedOnly = false, strict = false, updateModule) {
    if (masterPackageDefinition && packages.length > 0) {
      let shouldUpdateMaster = false
      for (const packageDefinition of packages) {
        const { dependencies, devDependencies, peerDependencies } = packageDefinition
        shouldUpdateMaster |= DependencyManager.updateMasterDependencies(masterPackageDefinition, dependencies, scope, scopedOnly)
        shouldUpdateMaster |= DependencyManager.updateMasterDependencies(masterPackageDefinition, devDependencies, scope, scopedOnly)
        shouldUpdateMaster |= DependencyManager.updateMasterDependencies(masterPackageDefinition, peerDependencies, scope, scopedOnly)
      }

      for (const packageDefinition of packages) {
        const shouldUpdatePackage = DependencyManager.updateDependencies(masterPackageDefinition, packageDefinition)
        if (shouldUpdatePackage && updateModule) {
          packageDefinition.version = semver.inc(packageDefinition.version, 'patch')
        }
      }

      for (const packageDefinition of packages) {
        DependencyManager.updateVersions(packageDefinition, scope, scopedOnly, strict)
      }
      DependencyManager.updateVersions(masterPackageDefinition, scope, scopedOnly, strict)

      if (shouldUpdateMaster) {
        masterPackageDefinition.version = semver.inc(masterPackageDefinition.version, 'patch')
      }
    }
  }

  static updateMasterDependencies(masterPackageDefinition, dependencies, scope, scopedOnly = false) {
    let shouldUpdateVersion = false
    const masterDependencies = masterPackageDefinition.dependencies
    for (const name in dependencies) {
      const version = dependencies[name]
      shouldUpdateVersion |= DependencyManager.updateMasterDependency(masterDependencies, name, version, scope, scopedOnly)
    }
    return shouldUpdateVersion
  }

  static updateMasterDependency(dependencies, name, version, scope, scopedOnly = false) {
    let shouldUpdateVersion = false
    if (version.match(/.*\d+\.\d+.\d+/)
      && (!scopedOnly && !name.match(new RegExp(`@${scope}.*`))
          || scopedOnly && name.match(new RegExp(`@${scope}.*`)))) {
      if (!dependencies[name]) {
        dependencies[name] = version
        shouldUpdateVersion = true
      } else {
        const v = dependencies[name]
        if (semver.lt(v.replace(/\^|~/g, ''), version.replace(/\^|~/g, ''))) {
          dependencies[name] = version
          shouldUpdateVersion = true
        }
      }
    }
    return shouldUpdateVersion
  }

  static updateDependencies(masterPackageDefinition, packageDefinition) {
    let shouldUpdateVersion = false
    const { dependencies: masterDependencies } = masterPackageDefinition
    const { dependencies, devDependencies, peerDependencies } = packageDefinition
    for (const name in masterDependencies) {
      const version = masterDependencies[name]
      shouldUpdateVersion |= DependencyManager.updateDependency(dependencies, name, version)
      shouldUpdateVersion |= DependencyManager.updateDependency(devDependencies, name, version)
      shouldUpdateVersion |= DependencyManager.updateDependency(peerDependencies, name, version)
    }
    return shouldUpdateVersion
  }

  static updateDependency(dependencies, name, version) {
    let shouldUpdateVersion = false
    if (dependencies && dependencies[name]) {
      const v = dependencies[name]
      if (v.replace(/\^|~/g, '') !== version.replace(/\^|~/g, '')) {
        dependencies[name] = version
        shouldUpdateVersion = true
      }
    }
    return shouldUpdateVersion
  }

  static updateVersions(packageDefinition, scope, scopedOnly = false, strict = false) {
    const { dependencies, devDependencies, peerDependencies } = packageDefinition
    DependencyManager.updateVersion(dependencies, scope, scopedOnly, strict)
    DependencyManager.updateVersion(devDependencies, scope, scopedOnly, strict)
    DependencyManager.updateVersion(peerDependencies, scope, scopedOnly, strict)
  }

  static updateVersion(dependencies, scope, scopedOnly = false, strict = false) {
    if (dependencies) {
      for (const name in dependencies) {
        if (!scopedOnly && !name.match(new RegExp(`@${scope}.*`))
            || scopedOnly && name.match(new RegExp(`@${scope}.*`))) {
          const version = dependencies[name]
          if (strict && version.match(/\^|~/g)) {
            dependencies[name] = version.replace('^', '').replace('~', '')
          } else if (!strict && !version.match(/\^|~/g)) {
            dependencies[name] = `^${version}`
          }
        }
      }
    }
  }

}

module.exports = DependencyManager
