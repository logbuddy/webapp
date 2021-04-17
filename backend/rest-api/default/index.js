'use strict'

exports.handler = function (event, context, callback) {
    var response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
        },
        body: '<p>Hello world 2!</p><pre><code>' + JSON.stringify(event, null, 2) + '</code></pre>',
    };
    callback(null, response);
}
