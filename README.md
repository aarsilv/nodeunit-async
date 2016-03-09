nodeunit-async
==============

Lightweight wrapper for running asynchronous [nodeunit](https://github.com/caolan/nodeunit) tests. Particularly useful for when you want common global setup or teardown
functions run for each test across multiple files, and/or fixture setup or teardown functions run once before and after all tests.

Designed for unit tests written using async's [auto](https://github.com/caolan/async#auto) and [waterfall](https://github.com/caolan/async#waterfall) methods.


Installation
============

    npm install nodeunit-async

Usage
=============

Nodeunit provides functionality for global setup and teardown functions on a per-file basis. For multiple files, construct a
NodeunitAsync in another file required by all test files.

The constructor can be passed up to four different main options.

* ```globalSetup``` - method called before each test case. Has one required argument which is the callback to call once the global setup is done.
* ```globalTeardown``` - method called after each test case. Has one required argument which is the callback to call once the global teardown is done.
* ```fixtureSetup``` - method called once before all test cases. Has one required argument which is the callback to call once the fixture setup is done.
* ```fixtureTeardown``` - method called once before after test cases. It takes no arguments.

There are secondary options as well for extra control.

* ```fixtureTeardownDelayMs``` - how many milliseconds to wait after the last test has finished to initiate the fixture teardown; Default is 100ms.
* ```teardownWhenNoTests``` - if true, teardown will run after the delay even if no tests have ever started.

The NodeunitAsync object has a ```runTest(test, methods)``` method which will execute nodeunit test methods. Any global or fixture setup and teardown methods will be called. It takes two arguments. The first argument is the test. The second argument can be:

* a function - this function will be executed for the test.
* an array of functions - these functions will be executed in the fashion of async's [waterfall](https://github.com/caolan/async#waterfall).
* an object - the properties of the object will be interpreted as functions t be executed in the fashion of async's [auto](https://github.com/caolan/async#auto).

There is also a ```testStart()``` method which will return a ```Date``` object constructed when the current test case was started.

Lastly, a listener is added to ```process.uncaughtException``` event which will fail end the currently running test so the rest of the suite can continue.

## Example: ##

The best way to understand how nodeunit-async works is with some simple examples!

Here we create a ```testHelper.js``` file which we include in all our test files giving us common global and fixture teardowns.
The test files have examples of asynchronous tests in the auto and waterfall style, as well as a synchronous test.

**/test/helpers/testHelper.js**

```javascript
var NodeunitAsync = require('nodeunit-async');
module.exports = new NodeunitAsync({
    globalSetup: function(callback) {
      console.log('global setup -- called before each test');
      callback();
    },
    globalTeardown: function(callback) {
      console.log('global teardown -- called after each test');
      callback();
    },
    fixtureSetup: function(callback) {
      console.log('fixture setup -- called once before all tests');
      callback();
    },
    fixtureTeardown: function() {
      console.log('fixture teardown -- called once after all tests');
    }
});
```

**/test/testFile1.js**

```javascript
var th = require('./helpers/testHelper');

exports.asyncAutoTest = function(test) {

    test.expect(2);

    th.runTest(test, {
        method1: [function(next) {
            console.log('Test Method 1');
            next(null, 2);
        }],
        method2: ['method1', function(next, results) {
            console.log('Test Method 2');
            next(null, results.method1+1);
        }],
        assertResults: ['method2', function(next, results) {
            console.log('Assertions');
            test.equal(2, results.method1);
            test.equal(3, results.method2);
            next();
        }]
    });
};

exports.asyncWaterfallTest = function(test) {

    test.expect(1);

    th.runTest(test, [
        function(next) {
            console.log('Test Method');
            next(null, 2);
        },
        function(result, next) {
            console.log('Assertions');
            test.equal(2, result);
            next();
        }
    ]);

};
```

**/test/testFile2.js**

```javascript
var th = require('./helpers/testHelper');

exports.syncTest = function(test) {
    th.runTest(test, function() {
        test.equal(2, 1+1);
        test.equal(3, 1+2);
        test.ok(new Date().getTime() >= th.testStart());
    });
};
```

These test files would be run using:

    nodeunit test/

### Inspiration ###

I found that for many of my projects' unit tests I want to connect to the database once, clear or drop my database's tables/collections (depending on DB) before each test, and close my database connection after all tests have executed.
Regarding the ```testStart()``` function, I often have tests checking that a ```lastModified``` or ```dateDeleted``` flag was appropriately set.

Tests
=====
To test (which requires [nodeunit](https://github.com/caolan/nodeunit) of course!) run:

    nodeunit test/

The test files themselves are good simple examples of how to use nodeunit-async.

Tested with node version >= 0.8.26.