'use strict'

var all = require('promised-utils').all
,   Q = require('q')

exports['test resolve several'] = function(assert, done) {
  var d1 = Q.defer(), d2 = Q.defer()
  Q.when(all([d1.promise, d2.promise]), function(value) {
    assert.equal(value[0], 1, '1st promise resolved correctly')
    assert.equal(value[1], 2, '2nd promise resolved correctly')
    done()
  }, function(reason) {
    assert.ok(false, 'non of the promises must be rejected')
    done()
  })
  d1.resolve(1)
  d2.resolve(2)
}

exports['test reject one'] = function(assert, done) {
  var d1 = Q.defer(), d2 = Q.defer()
  Q.when
  ( all([d1.promise, d2.promise])
  , function(value) {
      assert.fail('promise was resolved unexpectedly')
    }
  , function(reason) {
      done(assert.equal(reason, 'oops', 'promise was rejected'))
    }
  )
  d2.reject('oops')
}

if (module == require.main) require('test').run(exports)
