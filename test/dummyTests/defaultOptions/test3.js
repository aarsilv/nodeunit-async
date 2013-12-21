'use strict';

var NodeunitAsync = new require('../../../lib/nodeunitAsync');
var na = new NodeunitAsync();

exports.testAysncTestAuto = function(test) {

    test.expect(2);

    na.asyncTest(test, {
        method1: [function(next) {
            console.log('Test3 method1');
            next(null, 2);
        }],
        method2: ['method1', function(next, results) {
            console.log('Test3 method2');
            next(null, results.method1+1);
        }],
        assertResults: ['method2', function(next, results) {
            console.log('Test3 async assertions');
            test.equal(2, results.method1);
            test.equal(3, results.method2);
            console.log('Test3 async done');
            next();
        }]
    });
};
exports.testAysncTestSeries = function(test) {

    test.expect(1);

    var nums = [];

    na.asyncTest(test, [
        function(next) {
            console.log('Test3 method3');
            nums.push(1);
            next()
        },
        function(next) {
            console.log('Test3 method4');
            nums.push(2);
            next();
        },
        function(next) {
            console.log('Test3 second async assertions');
            test.deepEqual([1,2], nums);
            console.log('Test3 second async done');
            next();
        }
    ]);
};

exports.testSyncTest = function(test) {

    na.syncTest(test, function() {
        console.log('Test3 sync assertions');
        test.equal(2, 1+1);
        test.equal(3, 1+2);
        console.log('Test3 sync Done');
    });

};