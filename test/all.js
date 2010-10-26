'use strict'

exports['test `all`'] = require('./promised-all')
exports['test `Callback`'] = require('./promised-callback')
exports['test `Promised`'] = require('./promised-function')

if (module == require.main) require('test').run(exports)
