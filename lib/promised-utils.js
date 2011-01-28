'use strict'

// **Module exports set of of utility functions that are useful for working
// with promises.**

var Q = require('q'), when = Q.when, defer = Q.defer, Get = Q.get, Set = Q.set, Post = Q.post

,   _slice = Array.prototype.slice
,   _forEach = Array.prototype.forEach

// ## all ##
// Function takes array of promises and gives a new promise in return which will
// be fulfilled with an array of resolved promises that where passed. If any of
// the passed promises will get rejected, rejection will be forwarded to a
// returned promise.
/**
 * Creates promise for array of the promises that is resolved with an array
 * of the promise resolutions.
 * @param {Promise[]} promises
 *    Array of promises to create promise for.
 */
function all(promises) {
  var l = promises.length
  ,   values = []
  // If empty array is passed to the function it is returned immediately.
  if (0 == l) return values
  var deferred = defer()
  // Listeners are set for all the promises that where passed.
  _forEach.call(promises, function(promise, index) {
    when
    ( promise
    , function resolved(value) {
        // Resolved promises are stored in the array in the same exact order as
        // they where passed to the function.
        values[index] = value
        // If all the observed promises are resolved resulting promise is
        // resolved with an array of resolved promises.
        if (0 === --l) deferred.resolve(values)
      }
      // If for some reason one of the promises is rejected, resulting promise
      // is rejected with a same reason.
    , function rejected(reason) { deferred.reject(reason) }
    )
  })
  return deferred.promise
}
// **Example:**
//
//      var Q = require('q'), when = Q.when, defer = Q.defer
//      var all = require('promised-utils').all
//
//      var d1 = defer(), d2 = defer(), d3 = defer()
//      when
//      ( all([d1.promise, d2.promise, d3.promise])
//      , function resolved(values) {
//          var result = 0
//          values.forEach(function(value) { result += value })
//          console.log(result)
//        }
//      , function rejected(reason) { console.error(reason) }
//      )
//
//      d1.resolve(2)
//      d2.resolve(100)
//      d3.resolve(15)
//
//      // > 117
//
//
exports.all = all

// ## Promised ##
// Function takes an object or a function as it's first argument. If first
// argument is an object (or a promise that will be fulfilled to an object)
// promise with extended API is returned. Extended promises come with following
// methods: `get`, `set`, `invoke` to allow getting, setting properties on a
// fulfilled value of a promise or to invoke it's methods. All of this functions
// also return extended promises (for details see examples below). If first
// argument is type of function then it's then it's wrapper promised function
// is returned. Returned function takes promises as an arguments and returns a
// new promise, which is fulfilled to a return value of a wrapped function that
// is called when all the argument promises are resolved. If second option
// argument is falsy or is omitted, wrapped function will be passed one
// additional callback argument. In this case promise returned by a wrapper
// function will be fulfilled / broken when that callback function is called
// if first argument is non falsy promise is rejected with it, otherwise it is
// fulfilled with a second argument.
/**
 * @param {Function} callee
 * @returns {Promise}
 */
function Promised(callee, sync) {
  // If first argument is an object then wrapping it to a promise with an
  // extended API.
  if ('object' == typeof callee) return Object.create(when(callee), DPromised)
  // Passed function is wrapped into another, so called promised function, that
  // is returned as a result.
  return function promised() {
    // Returned function always returns a new promise when called.
    var deferred = defer()
    ,   reject = Reject(deferred, callee)
    // It also assumes that all of the arguments passed to it represent
    // promises.
    ,   possiblyPromises = _slice.call(arguments, 0)
    // In addition `this` pseudo-variable is also assumed to be a promise.
    possiblyPromises.unshift(this)
    // When all the possible promises are resolved, wrapped function is called
    when
    ( all(possiblyPromises)
    // It is called with resolved promises as an arguments.
    , function possiblePromisesResolved(params) {
        try {
          // If wrapped function was not identified as synchronous one
          // additional argument, callback function is passed to it.
          if (!sync) params.push(Callback(deferred))
          // Resolved `this` pseudo-variable is passed along.
          var value = callee.call.apply(callee, params)
          // If value returned by wrapped function was different from
          // `undefined` or function was identified as synchronous returned
          // promise will be resolved with it. Otherwise it will be rejected
          // or resolved when additional callback function is invoked. If first
          // argument to a callback function will be non-falsy promise will be
          // rejected with it, in opposite case promise will be resolved as
          // a second argument.
          if (sync || undefined !== value) deferred.resolve(value)
        } catch(error) {
          // If exception is thrown by wrapper function returned promise is
          // rejected with it.
          reject(error)
        }
      }
      // If for some reason one of the promises gets rejected, returned promise
      // will be rejected with same reason, but with additional details.
    , reject
    )
    return deferred.promise
  }
}
// **Example:**
//
//      // function
//
//      var Q = require('q'), when = Q.when, defer = Q.defer
//      var Promised = require('promised-utils').Promised
//
//      var promisedSum = Promised(function sum(a, b) {
//        return a + b
//      })
//
//      var a = defer(), b = defer()
//      when(promisedSum(a.promise, b.promise), console.log, console.error)
//
//      a.resolve(2)
//      b.resolve(3)
//
//      // > 5
//
//      // object
//
//      var deferred = Promised(defer())
//      print = Promised.sync(console.log.bind(console))
//      print(promise.get('some.object.message')
//      promise.set('some.object.property', { foo: 'bar' })
//      print(promise.invoke('some.object.talk, ['world']))
//      setTimeout(function() {
//        deferred.resolve(
//        { some:
//          { object:
//            { message: 'Hello {{name}} !'
//            , talk: function talk(name) {
//               return this.message.replace('{{name}}', name);
//              }
//            }
//          }
//        })
//      }, 100)
//      // 'Hello {{name}} !' will be printed in 100ms.
//      // 'Hello world !' will be printed in 100ms.
//
exports.Promised = Promised
// ### Promised.async ###
// At the moment functions wrapped by `Promised` are assumed to by asynchronous
// and they are called with additional callback argument. This assumption may
// change in a future version and this function can be used to explicitly
// highlight that passed function is synchronous and it expects to get
// a callback as a last argument.
Promised.async = Promised
// ### Promised.sync ###
// As it was mentioned above `Promised` function assumes that functions passed
// to it are asynchronous and they will be called with an extra callback
// argument. This will work just fine in many cases, but not in cases where
// wrapped function expects unlimited amount of arguments and does not performs
// any checks on them.
Promised.sync = function syncPromised(callee) {
  return Promised(callee, true)
}
// **Example:**
//
//      var Q = require('q'), when = Q.when, defer = Q.defer
//      var Promised = require('promised-utils').Promised
//
//      var promisedConcat = Promised.sync(String.prototype.concat.bind(''))
//      var d = defer()
//      var promisedString = promisedConcat('Hello ', d.promise)
//      when(promisedString, console.log) // will print Hello World
//      d.resolve('World')

// ## Reject ##
// Function takes deferred promise and function performing operation that may
// throw an exception that should result in rejection of promise.
function Reject(deferred, callee) {
  // Callback function is returned as a result value.
  return function reject(reason) {
    // If callback is called wrapped promise is rejected with:
    deferred.reject(
    // - Function name containing logic.
    { at: callee.name
    // - Reason (thrown exception or string)
    , cause: reason
    // - Error stack trace
    , stack: new Error(callee.name).stack
    })
  }
}
// ## Callback ##
// Function takes deferred promise and returns [node.js](http://nodejs.org/)
// style callback function.
/**
 * @param {Deferred}
 * @returns {Function}
 */
function Callback(deferred) {
  return function callback(error, value) {
    // If returned callback is called with first non-falsy argument,
    // wrapped promise is rejected with it.
    if (error) deferred.reject(error)
    // Otherwise promise is resolved with a value of a second argument.
    else deferred.resolve(value)
  }
}
exports.Callback = Callback
// **Example:**
//
//      var Callback = require('promised-utils').Callback
//      ,   q = require('q'), when = q.when, defer = q.defer
//
//      function promisedReadFile(path) {
//        var deferred = defer()
//        require('fs').readFile(Callback(deferred))
//        return deferred
//      }
//
// # print #
// Promised print function, just an utility to log promise values when they
// are resolved.
exports.print = Promised.sync(console.log.bind(console))

// Extensions added to a promises returned by `Promised`
var DPromised =
{ get: { value: function get(path) {
    return Object.create(when(path, function onPath(path) {
      return String(path).split('.').reduce(Get, this)
    }.bind(this)), DPromised)
  }}
, set: { value: function set(path, value) {
    return when(path, function onPath(path) {
      path = String(path).split('.')
      var name = path.pop()
      return Q.put(path.reduce(Get, this), name, value)
    }.bind(this))
  }}
, invoke: { value: function invoke(path, params) {
    return Object.create(when(path, function onPath(path) {
      path = String(path).split('.')
      var name = path.pop(), target = path.reduce(Get, this)
      return !params ? Post(target, name) :
              when(all(params), function onParams(params) {
                return Post.apply(null, [target, name].concat(params))
              })
    }.bind(this)), DPromised)
  }}
}
