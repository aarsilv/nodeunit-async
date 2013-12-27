'use strict';

var async = require('async');

function NodeunitAsync(options) {
    options = options || {};
    this.globalSetup = options.globalSetup;
    this.globalTeardown = options.globalTeardown;

    this.fixtureSetup = options.fixtureSetup;
    this.fixtureTeardown = options.fixtureTeardown;
    this.fixtureTeardownDelayMs = options.fixtureTeardownDelayMs || 100;

    this.fixtureSetupRun = false;
    this.lastTeardownTimebomb = null;
    this.lastTestStart = null;
}

NodeunitAsync.prototype.runTest = function(test, testMethods) {
    var self = this;

    if (typeof testMethods === 'undefined') {
        throw new Error('Expecting test and testMethods for this asyncTest, did you forget one?');
    }

    self._startTest();
    async.auto({
        fixtureSetup: [function(next) {
            // if we have a fixture setup that has not yet been run, call it
            if (self.fixtureSetup && !self.fixtureSetupRun) {
                self.fixtureSetupRun = true;
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
        self._endTest(test);
    });
};

NodeunitAsync.prototype.testStart = function() {
    return this.lastTestStart;
};

NodeunitAsync.prototype._startTest = function() {
    // save time test was started
    this.lastTestStart = new Date();
    // if a fixture teardown timebomb is armed, disarm it
    if (this.lastTeardownTimebomb) {
        this.lastTeardownTimebomb.disarm();
        this.lastTeardownTimebomb = null;
    }
};

NodeunitAsync.prototype._endTest = function(test) {
    if (this.lastTeardownTimebomb) {
        throw new Error('Unexpected overlapping of fixtureTeardown');
    }
    // if we have a fixture teardown, arm it as a timebomb
    if (this.fixtureTeardown) {
        this.lastTeardownTimebomb = new Timebomb(this.fixtureTeardownDelayMs, this.fixtureTeardown);
    }
    test.done();
};

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

Timebomb.prototype.disarm = function() {
    this.armed = false;
};

module.exports = NodeunitAsync;