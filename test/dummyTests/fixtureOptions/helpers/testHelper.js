'use strict';

var NodeunitAsync = require('../../../../lib/nodeunitAsync');

module.exports = new NodeunitAsync({
    globalSetup: function(callback) {
        console.log('global setup');
        callback();
    },
    globalTeardown: function(callback) {
        console.log('global teardown');
        callback();
    },
    fixtureSetup: function(calback) {
        console.log('fixture setup');
        calback();
    },
    fixtureTeardown: function() {
        console.log('fixture teardown');
    }
});