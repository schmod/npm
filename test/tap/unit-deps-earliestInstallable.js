'use strict'
var test = require('tap').test
var requireInject = require('require-inject')

// we're just mocking to avoid having to call `npm.load`
var deps = requireInject('../../lib/install/deps.js', {
  '../../lib/npm.js': {
    config: {
      get: function (val) { return (val === 'global-style' || val === 'legacy-bundling') ? false : 'mock' }
    }
  }
})

var earliestInstallable = deps.earliestInstallable

test('earliestInstallable should consider devDependencies', function (t) {
  var dep1 = {
    children: [],
    package: {
      name: 'dep1',
      dependencies: { dep2: '2.0.0' }
    }
  }

  // a library required by the base package
  var dep2 = {
    package: {
      name: 'dep2',
      version: '1.0.0'
    }
  }

  // an incompatible verson of dep2. required by dep1
  var dep2a = {
    package: {
      name: 'dep2',
      version: '2.0.0'
    },
    parent: dep1
  }

  var pkg = {
    children: [dep1],
    package: {
      name: 'pkg',
      dependencies: { dep1: '1.0.0' },
      devDependencies: { dep2: '1.0.0' }
    }
  }

  dep1.parent = pkg
  dep2a.parent = dep1
  dep2.parent = pkg

  var earliest = earliestInstallable(dep1, dep1, dep2a.package)
  t.isDeeply(earliest, dep1, 'should hoist package when an incompatible devDependency is present')
  t.end()
})
