'use strict'

exports['test `all`'] = require('./promised-all')

if (module == require.main) require('test').run(exports)
