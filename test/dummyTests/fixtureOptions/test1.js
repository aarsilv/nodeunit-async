'use strict';

var th = require('./helpers/testHelper');

exports.testAysncTestAuto = function(test) {

    test.expect(2);

    th.asyncTest(test, {
        method1: [function(next) {
            console.log('Test1 method1');
            next(null, 2);
        }],
        method2: ['method1', function(next, results) {
            console.log('Test1 method2');
            next(null, results.method1+1);
        }],
        assertResults: ['method2', function(next, results) {
            console.log('Test1 async assertions');
            test.equal(2, results.method1);
            test.equal(3, results.method2);
            console.log('Test1 async Done');
            next();
        }]
    });
};

exports.testAysncTestSeries = function(test) {

    test.expect(1);

    var nums = [];

    th.asyncTest(test, [
        function(next) {
            console.log('Test1 method3');
            nums.push(1);
            next()
        },
        function(next) {
            console.log('Test1 method4');
            nums.push(2);
            next();
        },
        function(next) {
            console.log('Test1 second async assertions');
            test.deepEqual([1,2], nums);
            console.log('Test1 second async done');
            next();
        }
    ]);
};

exports.testSyncTest = function(test) {

    th.syncTest(test, function() {
        console.log('Test1 sync assertions');
        test.equal(2, 1+1);
        test.equal(3, 1+2);
        console.log('Test1 sync done');
    });

};