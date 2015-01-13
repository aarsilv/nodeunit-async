'use strict';

var async = require('async');
var colors = require('colors/safe');

/**
 * Constructs the NodeunitAsync test runner.
 * @param [options] {object} used to specify global and fixture setup and teardowns:
 *   globalSetup function run before each test.
 *   globalTeardown function run after each test (may not run if error is encountered)
 *   fixtureSetup: function run once before all the tests.
 *   fixtureTeardown: function run once after all the tests (may not run if error is encountered)
 *   fixtureTeardownDelayMs: how long we allow after the last test has finished and before the start of the next test
 *                           to determine all test cases have run.
 *   failOnCallbackError: if true, tests that call back with an error will cause that error to generate a test failure
 *                        rather than throw an exception. This is useful for projects that have uncaughtException handlers
 *                        that may cause undesirable beauvoir.
 * @constructor
 */
function NodeunitAsync(options) {
    options = options || {};
    this.globalSetup = options.globalSetup;
    this.globalTeardown = options.globalTeardown;

    this.fixtureSetup = options.fixtureSetup;
    this.fixtureTeardown = options.fixtureTeardown;
    this.fixtureTeardownDelayMs = options.fixtureTeardownDelayMs || 100;

    this.failOnCallbackError = options.failOnCallbackError;

    this._currentTest = null;
    this._fixtureSetupRun = false;
    this._lastTeardownTimebomb = null;
    this._lastTestStart = null;

    // Start off with a teardown timebomb in case no test cases are to be run
    if (this.fixtureTeardown) {
        this._lastTeardownTimebomb = new Timebomb(this.fixtureTeardownDelayMs, this.fixtureTeardown);
    }
}

// Singleton pointer to current test being run
NodeunitAsync.activeNodeunitAync = null;

// Uncaught errors will end the current test
process.on('uncaughtException', function(err) {

    console.log(colors.red('Uncaught Exception'));
    console.log(colors.red(err.message));
    console.log(colors.red(err.stack));

    if (NodeunitAsync.activeNodeunitAync) {
        NodeunitAsync.activeNodeunitAync._endTest();
    } else {
        console.log(colors.yellow('Unable to determine current test error encountered in, re-throwing'));
        throw err;
    }

});

/**
 * Runs a test
 * @param test {object} the nodeunit test object
 * @param testMethods {function|function[]|object} one of three things:
 *    1) a single, parameterless function wrapping synchronous test code to execute
 *    2) an array of functions to be executed in the style of the async module's waterfall
 *    3) an object whose properties are arrays of strings and functions executed in the style of the aysnc module's auto
 */
NodeunitAsync.prototype.runTest = function(test, testMethods) {
    var self = this;

    NodeunitAsync.activeNodeunitAync = self;
    self._currentTest = test;

    if (typeof testMethods === 'undefined') {
        throw new Error('Expecting test and testMethods for this asyncTest, did you forget one?');
    }

    self._startTest();
    async.auto({
        fixtureSetup: [function(next) {
            // if we have a fixture setup that has not yet been run, call it
            if (self.fixtureSetup && !self._fixtureSetupRun) {
                self._fixtureSetupRun = true;
                self.fixtureSetup(next);
            } else {
                next();
            }
        }],
        globalSetUp: ['fixtureSetup', function(next) {
            // if we have a global setup, call it
            self.globalSetup ? self.globalSetup(next) : next();
        }],
        testMethods: ['globalSetUp', function(next) {
            // run the test
            if (typeof testMethods === 'function') {
                // single function, run it
                testMethods();
                next();
            } else if (testMethods instanceof Array) {
                // array of functions, assume waterfall
                async.waterfall(testMethods, next);
            } else {
                // non array object, assume auto
                async.auto(testMethods, next);
            }
        }],
        globalTeardown: ['testMethods', function(next) {
            // if we have a global teardown, call it
            self.globalTeardown ? self.globalTeardown(next) : next();
        }]
    }, function(err) {
        if (err) {
            throw err;
        }
        self._endTest();
    });
};

/**
 * Get a date object constructed at the start of the current test
 * @returns {Date} the date the current test was started
 */
NodeunitAsync.prototype.testStart = function() {
    return this._lastTestStart;
};

/**
 * Starts a test
 * @private
 */
NodeunitAsync.prototype._startTest = function() {
    // save time test was started
    this._lastTestStart = new Date();
    // if a fixture teardown timebomb is armed, disarm it
    if (this._lastTeardownTimebomb) {
        this._lastTeardownTimebomb.disarm();
        this._lastTeardownTimebomb = null;
    }
};

/**
 * Ends a test
 * @private
 */
NodeunitAsync.prototype._endTest = function() {
    if (this._lastTeardownTimebomb) {
        throw new Error('Unexpected overlapping of fixtureTeardown');
    }
    // if we have a fixture teardown, arm it as a timebomb
    if (this.fixtureTeardown) {
        this._lastTeardownTimebomb = new Timebomb(this.fixtureTeardownDelayMs, this.fixtureTeardown);
    }
    this._currentTest.done();
    this._currentTest = null;
    NodeunitAsync.activeNodeunitAync = null;
};

/**
 * Helper "timebomb" class used for implementing the global teardown. Executesthe callback after the given delay, unless
 * it is "disarmed".
 * @param delay {number} how long until the timebomb executes its callback.
 * @param callback {function} function to execute when the timebomb "explodes"; no parameters passed.
 * @constructor
 */
function Timebomb(delay,callback) {
    this.armed = true;
    var self = this;
    setTimeout(function() {
        //only want to close when everything is done
        if (self.armed) {
            callback();
        }
    }, delay);
}

/**
 * Disarms the timebomb so the callback will never be called
 */
Timebomb.prototype.disarm = function() {
    this.armed = false;
};

module.exports = NodeunitAsync;