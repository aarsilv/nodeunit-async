'use strict';

var th = require('../helpers/testHelper');

exports.testAysncTest = function(test) {

    test.expect(2);

    th.runTest(test, {
        method1: [function(next) {
            console.log('Test2 method1');
            next(null, 2);
        }],
        method2: ['method1', function(next, results) {
            console.log('Test2 method2');
            next(null, 3);
        }],
        assertResults: ['method2', function(next, results) {
            console.log('Test2 async assertions');
            test.equal(2, results.method1);
            test.equal(3, results.method2);
            console.log('Test2 async done');
            next();
        }]
    });
};

exports.testSyncTest = function(test) {

    th.runTest(test, function() {
        console.log('Test2 sync assertions');
        test.equal(2, 1+1);
        test.equal(3, 1+2);
        console.log('Test2 sync done');
    });

};