var options = require("./collector-config"),
    cube = require("../"),
    server = cube.server(options);

server.register = cube.collector.register;

server.start();
