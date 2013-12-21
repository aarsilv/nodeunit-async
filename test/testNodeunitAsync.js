var spawn = require('child_process').spawn;

exports.testDefaults = function(test) {
    test.expect(1);
    nodeUnitToCleanedOutput('test/dummyTests/defaultOptions', function(err, output) {
        var expectedLines = [
            'test3',
            'Test3 method1',
            'Test3 method2',
            'Test3 async assertions',
            'Test3 async done',
            '✔ testAysncTestAuto',
            'Test3 method3',
            'Test3 method4',
            'Test3 second async assertions',
            'Test3 second async done',
            '✔ testAysncTestSeries',
            'Test3 sync assertions',
            'Test3 sync Done',
            '✔ testSyncTest',
            'OK: 5 assertions'
        ];
        if (err) {
            throw err;
        }
        test.deepEqual(expectedLines, output);
        test.done();
    });
};

exports.testFixture = function(test) {
    test.expect(1);
    nodeUnitToCleanedOutput('test/dummyTests/fixtureOptions', function(err, output) {
        var expectedLines = [
            'test1',
            'fixture setup',
            'global setup',
            'Test1 method1',
            'Test1 method2',
            'Test1 async assertions',
            'Test1 async Done',
            'global teardown',
            '✔ testAysncTestAuto',
            'global setup',
            'Test1 method3',
            'Test1 method4',
            'Test1 second async assertions',
            'Test1 second async done',
            'global teardown',
            '✔ testAysncTestSeries',
            'Test1 sync assertions',
            'Test1 sync done',
            '✔ testSyncTest',
            'test2',
            'global setup',
            'Test2 method1',
            'Test2 method2',
            'Test2 async assertions',
            'Test2 async done',
            'global teardown',
            '✔ testAysncTest',
            'Test2 sync assertions',
            'Test2 sync done',
            '✔ testSyncTest',
            'OK: 9 assertions',
            'fixture teardown'
        ];
        if (err) {
            throw err;
        }
        test.deepEqual(expectedLines, output);
        test.done();
    });
};

function nodeUnitToCleanedOutput(targetPath, callback) {
    var cmd = './node_modules/nodeunit/bin/nodeunit';
    var args = [targetPath];
    var testOutput = '';
    var testError = '';

    var nodeunit = spawn(cmd, args);

    nodeunit.stdout.on('data', function (data) {
        testOutput += data;
    });

    nodeunit.stderr.on('data', function (data) {
        testError += data;
    });

    nodeunit.on('close', function () {
        var rawOutputLines = [];
        if (testError) {
            return callback(new Error('Test sent output to stderr: '+testError));
        }
        testOutput.split('\n').forEach(function(line) {
            // strip out any (XXms) as well as console formatting
            line = line.replace(/(\s+\(\d+ms\)|[^a-zA-Z]\[\d+m)/g, '').trim();
            if (line) {
                rawOutputLines.push(line);
            }
        });
        callback(null, rawOutputLines);
    });
}