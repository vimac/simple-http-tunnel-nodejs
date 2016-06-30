/**
 * 允许访问的服务器列表, 支持正则表达式或者字符串精确匹配
 */
var whiteList = ["github.com:80", "github.com:443", /\S*vifix\.cn:(443|80)/];

var bindHost = "0.0.0.0";
var bindPort = 8888;

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

module.exports = {
    "whiteList": whiteList,
    "bindHost": bindHost,
    "bindPort": bindPort,
    "logConfig": logConfig
}
