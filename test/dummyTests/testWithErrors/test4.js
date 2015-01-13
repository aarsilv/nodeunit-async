'use strict';

var th = require('../helpers/testHelper');

exports.testAysncTestAutoCallbackError = function(test) {

    test.expect(1);

    console.log('testAysncTestAutoCallbackError');

    th.runTest(test, {
        method: [function(next) {
            next(new Error('Auto Callback Error'));
        }]
    });
};

exports.testAysncTestAutoThrownError = function(test) {

    test.expect(1);

    console.log('testAysncTestAutoThrownError');

    th.runTest(test, {
        method: [function(next) {
            next(new Error('Auto Thrown Error'));
        }]
    });
};

exports.testAysncTestWaterfallCallbackError = function(test) {

    test.expect(1);

    console.log('testAysncTestWaterfallCallbackError');

    th.runTest(test, [
        function(next) {
            next(new Error('Waterfall Callback Error'));
        }
    ]);
};

exports.testAysncTestWaterfallThrownError = function(test) {

    test.expect(1);

    console.log('testAysncTestWaterfallThrownError');

    th.runTest(test, [
        function(next) {
            throw new Error('Waterfall Callback Error');
        }
    ]);
};

exports.testSyncTestThrownError = function(test) {

    console.log('testSyncTestThrownError');

    th.runTest(test, function() {
        throw new Error('Sync Thrown Error');
    });

};

exports.testThatWillPass = function(test) {

    test.expect(2);

    console.log('testThatWillPass');

    th.runTest(test, {
        method: [function(next) {
            test.equal(2, 1 + 1);
            test.equal(4, 2 + 2);
            next();
        }]
    });

};