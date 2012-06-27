var options = require("./evaluator-config"),
    cube = require("../"),
    server = cube.server(options);

server.register = cube.evaluator.register;
server.start();
