var http = require('http');
var net = require('net');
var url = require('url');
var Log = require('fuzelog');
var config = require('./config');
var log = new Log(config.logConfig);
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

function onConnect(clientRequest, clientSocket) {
    var requestUrl = clientRequest.url;
    var hostParts = requestUrl.match(/^(\S+):(\d{1,5})$/);
    var host = hostParts[1];
    var port = hostParts[2];

    var passed = false;
    for (var i = 0; i < config.whiteList.length; i++) {
        if (typeof config.whiteList[i] == 'string' && requestUrl == config.whiteList[i]) {
            passed = true;
            break;
        } else if (config.whiteList[i]instanceof RegExp && requestUrl.match(config.whiteList[i])) {
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

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        log.info(sprintf('forking for cpu %s', i));
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        log.info(printf('worker %s died', worker.process.pid))
    });
} else {
    http.createServer().on('connect', onConnect).listen(config.bindPort, config.bindHost);
}
