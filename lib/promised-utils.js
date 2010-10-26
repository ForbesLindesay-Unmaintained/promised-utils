'use strict'

// **Collection of of utility functions that are useful when working
// with promises.**


var Q = require('q'), when = Q.when, asap = Q.asap, defer = Q.defer

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
exports.all = function all(promises) {
  var deferred = defer()
  ,   values = []
  ,   l = arguments.length
  promises.forEach(function(promise, index) {
    asap
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
exports.Callback = function Callback(deferred) {
  return function callback(error, value) {
    if (error) deferred.reject(error)
    else deferred.resolve(value)
  }
}

