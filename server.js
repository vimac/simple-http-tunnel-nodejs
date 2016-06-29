var http = require('http');
var net = require('net');
var url = require('url');
var Log = require('fuzelog');
var logConfig = {
    level: 'info', // INFO logging level
    name: 'tunnel', // Category name, shows as %c in pattern
    // FileStream to log to (can be file name or a stream)
    file: __dirname + '/proxy.log',
    fileFlags: 'a', // Flags used in fs.createWriteStream to create log file
    consoleLogging: true, // Flag to direct output to console
    colorConsoleLogging: true, // Flag to color output to console
    // Usage of the log4js layout
    logMessagePattern: '[%d{ISO8601}] [%p] %m{1}'
};
var log = new Log(logConfig);

var allowHosts = ["github.com:80", "github.com:443", /.*vifix\.cn:80/, /.*vifix\.cn:443/];

function connect(clientRequest, clientSocket) {
    var requestUrl = clientRequest.url;
    var hostParts = requestUrl.match(/^(\S+):(\d{1,5})$/);
    var host = hostParts[1];
    var port = hostParts[2];

    var passed = false;
    for (var i = 0; i < allowHosts.length; i++) {
        if (typeof allowHosts[i] == 'string' && requestUrl == allowHosts[i]) {
            passed = true;
            break;
        } else if (allowHosts[i]instanceof RegExp && requestUrl.match(allowHosts[i])) {
            passed = true;
            break;
        }
    }
    if (!passed) {
        log.error(sprintf("forbidden: %s connect to %s:%s ", clientSocket.remoteAddress, host, port));
        clientSocket.end();
        return;
    }

    log.info(sprintf("%s connect to %s:%s", clientSocket.remoteAddress, host, port));

    var remoteSocket = net.connect(port, host, function() {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        remoteSocket.pipe(clientSocket);
        log.info(sprintf("%s connected to %s:%s.", clientSocket.remoteAddress, host, port));
    }).on('error', function(e) {
        log.error('something happened');
        clientSocket.end();
    });

    clientSocket.pipe(remoteSocket);
}

http.createServer().on('connect', connect).listen(8888, '0.0.0.0');
