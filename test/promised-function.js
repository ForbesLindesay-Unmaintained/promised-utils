'use strict'

var Promised = require('promised-utils').Promised
,   Q = require('q')

exports['test sync function resolve args'] = function(assert, done) {
  var d1 = Q.defer()
  ,   d2 = Q.defer()
  ,   v1 = 'foo'
  ,   v2 = 'bar'
  ,   v3 = 'baz'
  ,   resolved = false
  
  var f = Promised(function(a, b, c) {
    assert.ok(resolved, 'function is called when promises are resolved')
    assert.equal(a, v1, '`a` resolved as expected')
    assert.equal(b, v2, '`b` resolved as expected')
    assert.equal(c, v3, '`c` resolved as expected')
    return a + b + c
  })
  var r = f(d1.promise, d2.promise, v3)

  Q.when
  ( r
  , function(value) {
      assert.ok(resolved, 'returned value resolved when promises are resolved')
      assert.equal(value, v1 + v2 + v3, 'result promise resolved correctly')
      done()
  }, function(reason) {
      assert.fail('result promise must not be rejected:' + reason)
      done()
  })

  d1.resolve(v1)
  d2.resolve(v2)
  resolved = true
}

exports['test sync function reject args'] = function(assert, done) {
  var d1 = Q.defer()
  ,   d2 = Q.defer()
  ,   v1 = 'foo'
  ,   v3 = 'baz'
  ,   error = 'oops'
  
  var f = Promised(function f(a, b, c) {
    assert.fail('wrapped function should never be called')
  })
  var r = f(d1.promise, d2.promise, v3)

  Q.when
  ( r
  , function(value) {
      assert.fail('result promise must not be resolved:' + value)
      done()
  }, function(reason) {
      assert.equal(reason.message, 'f', 'got the function name')
      assert.equal(reason.cause, error, 'got the cause correctly')
      done()
  })

  d1.resolve(v1)
  d2.reject(error)
  resolved = true
}

exports['test async function resolve args'] = function(assert, done) {
  var d1 = Q.defer()
  ,   d2 = Q.defer()
  ,   v1 = 'foo'
  ,   v2 = 'bar'
  ,   v3 = 'baz'
  ,   resolved = false
  
  var f = Promised(function(a, b, c, callback) {
    assert.ok(resolved, 'function is called when promises are resolved')
    assert.equal(a, v1, '`a` resolved as expected')
    assert.equal(b, v2, '`b` resolved as expected')
    assert.equal(c, v3, '`c` resolved as expected')
    callback(null, a + b + c)
  })
  var r = f(d1.promise, d2.promise, v3)

  Q.when
  ( r
  , function(value) {
      assert.ok(resolved, 'returned value resolved when promises are resolved')
      assert.equal(value, v1 + v2 + v3, 'result promise resolved correctly')
      done()
  }, function(reason) {
      assert.fail('result promise must not be rejected:' + reason)
      done()
  })

  d1.resolve(v1)
  d2.resolve(v2)
  resolved = true
}

exports['test async reject on first error arg'] = function(assert, done) {
  var d1 = Q.defer()
  ,   d2 = Q.defer()
  ,   v1 = 'foo'
  ,   v2 = 'bar'
  ,   v3 = 'baz'
  ,   resolved = false
  ,   error = new Error('boom')
  
  var f = Promised(function f(a, b, c, callback) {
    assert.ok(resolved, 'function is called when promises are resolved')
    assert.equal(a, v1, '`a` resolved as expected')
    assert.equal(b, v2, '`b` resolved as expected')
    assert.equal(c, v3, '`c` resolved as expected')
    callback(error, a + b + c)
  })
  var r = f(d1.promise, d2.promise, v3)

  Q.when
  ( r
  , function(value) {
      assert.fail('result promise must not be resolved:' + value)
      done()
    }
  , function(reason) {
      assert.equal(reason, error, 'got the corrert reject reason')
      done()
  })

  d1.resolve(v1)
  d2.resolve(v2)
  resolved = true
}

exports['test reject because of exception'] = function(assert, done) {
  var d1 = Q.defer()
  ,   d2 = Q.defer()
  ,   v1 = 'foo'
  ,   v2 = 'bar'
  ,   v3 = 'baz'
  ,   resolved = false
  ,   error
  
  var f = Promised(function f(a, b, c, callback) {
    assert.equal(a, v1, '`a` resolved as expected')
    assert.equal(b, v2, '`b` resolved as expected')
    assert.equal(c, v3, '`c` resolved as expected')
    throw error = new Error('boom')
  })
  var r = f(d1.promise, d2.promise, v3)

  Q.when
  ( r
  , function(value) {
      assert.fail('result promise must not be resolved:' + value)
      done()
    }
  , function(reason) {
      assert.equal(reason.message, 'f', 'got the function name correctly')
      assert.equal(reason.cause, error, 'got the cause corrertly')
      done()
  })

  d1.resolve(v1)
  d2.resolve(v2)
  resolved = true
}


if (module == require.main) require('test').run(exports)
