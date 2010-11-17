'use strict'

// **Collection of of utility functions that are useful when working
// with promises.**

var Q = require('q'), when = Q.when, defer = Q.defer

// function takes array of promises and returns a new promise, which will be
// resolved with an array of associated values. In case if any of the passed
// promises is rejected, returned promise will be rejected as well.
//
// **Example:**
//
//      when
//      ( all([promise1, promise2, promise3])
//      , function resolved(values) {
//          var result = 0
//          values.forEach(function(value) {
//            result += value
//          })
//          doSomething(result)
//        }
//      , function rejected(reason) {
//          console.error(reason)
//        }
//      }
/**
 * Creates promise for array of the promises that is resolved with an array
 * of the promise resolutions.
 * @param {Promise[]} promises
 *    Array of promises to create promise for.
 */
function all(promises) {
  var l = promises.length
  ,   values = []
  // if there nothing is passed returning an empty array
  if (0 == l) return values
  var deferred = defer()
  Array.prototype.forEach.call(promises, function(promise, index) {
    when
    ( promise
    , function(value) {
        values[index] = value
        if (0 === --l) deferred.resolve(values)
      }
    , function(reason) { deferred.reject(reason) }
    )
  })
  return deferred.promise
}
exports.all = all

// Function takes deferred promise and returns node.js style callback
// function. If returned callback is called with first non falsy argument
// wrapped promise will be rejected with it, otherwise promise will be
// resolved with a value of the second argument that callaback funcion was
// called with.
//
// **Example:**
//
//      var Callback = require('promised-utils').Callback
//      ,   q = require('q'), when = q.when, defer = q.defer
//      
//      function promisedReadFile(path) {
//        var deferred = defer()
//        require('fs').readFile(Callback(deferred)
//        return deferred
//      }
//
/**
 * @param {Deferred}
 * @returns {Function}
 */
function Callback(deferred) {
  return function callback(error, value) {
    if (error) deferred.reject(error)
    else deferred.resolve(value)
  }
}
exports.Callback = Callback


// Function returns wrapper function for the passed function. Wrapper function
// always returns a promise, that either will be resolved to a value returned
// by a wrapped function or rejected with an error if wrapped function will
// throw. Wrapper function treats all the arguments passed to it as promises,
// it waits waits untill all are resolved to call a wrapped function with a
// resolution values. This allows wrapping liniar function in a way that they
// don't have to care whether arguments being passed are promises or not.
//
// **Example:**
//
//      var Promised = require('promised-utils').Promised
//      var promisedSum = Promised(function sum(number1Promise, number2Promise) {
//        return number1Promise + number2Promise
//      })
/**
 * @param {Function} callee
 * @returns {Promise}
 */
function Promised(callee, sync) {
  return function promised() {
    var deferred = defer()
    ,   reject = Reject(deferred, callee)
    ,   self = this

    when
    ( all(arguments)
    , function promisedArgumentsResolved(params) {
        try {
          if (!sync) params.push(Callback(deferred))
          var value = callee.apply(self, params)
          if (sync || undefined !== value) deferred.resolve(value)
        } catch(e) {
          reject(e)
        }
      }
    , reject
    )
    return deferred.promise
  }
}
Promised.async = Promised
Promised.sync = function syncPromised(callee) {
  return Promised(callee, true)
}
exports.Promised = Promised

function Reject(deferred, callee) {
  return function reject(reason) {
    deferred.reject(
    { at: callee.name
    , cause: reason
    , stack: new Error(callee.name).stack
    })
  }
}
