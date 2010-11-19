'use strict'

var Callback = require('promised-utils').Callback
,   Q = require('q')

exports['test callback with first `null` argument resolves'] = function(assert, done) {
  var d = Q.defer()

  Q.when
  ( d.promise
  , function(value) {
      assert.equal(value, 'resolve', 'promise resolved with the second arg')
      done()
    }
  , function(reason) {
      assert.fail('promise should not be rejected if first argument is null')
      done()
    }
  )
  Callback(d)(null, 'resolve')
}

exports['test callback with first argument rejects'] = function(assert, done) {
  var d = Q.defer()
  ,   error = new Error('boom')

  Q.when
  ( d.promise
  , function(value) {
      assert.fail('promise should not be resolved if first argument is truthy')
      done()
    }
  , function(reason) {
      assert.equal(error, reason, 'promise should be rejected with firs arg')
      done()
    }
  )
  Callback(d)(error)
}

if (module == require.main) require('test').run(exports)
