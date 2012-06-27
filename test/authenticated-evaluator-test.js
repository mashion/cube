var vows   = require("vows"),
    assert = require("assert"),
    cube   = require("../"),
    test   = require("./test");

var suite = vows.describe("authenticated-evaluator");

var port = ++test.port, server = cube.server({
  "mongo-host": "localhost",
  "mongo-port": 27017,
  "mongo-database": "cube_test",
  "http-port": port,
  "authentication": function (data, successFn, failureFn) {
    if (data.user === "goodUser" && data.password === "goodPassword") {
      successFn();
    } else {
      failureFn();
    }
  }
});

server.register = cube.evaluator.register;

server.start();

suite.addBatch(test.batch({
  "GET /event/get with valid credentials": {
    topic: test.request({method: "GET",
                         port: port,
                         path: "/1.0/event/get?expression=test(index)&user=goodUser&password=goodPassword"
    }),
    "responds with status 200": function(response) {
      assert.equal(response.statusCode, 200);
      assert.deepEqual(JSON.parse(response.body), []);
    }
  }
}));

suite.addBatch(test.batch({
  "GET /event/get with invalid credentials": {
    topic: test.request({method: "GET",
                         port: port,
                         path: "/1.0/event/get?expression=test(index)&user=goodUser&password=badPassword"
    }),
    "responds with status 401": function(response) {
      assert.equal(response.statusCode, 401);
      assert.deepEqual(JSON.parse(response.body), {error: "AuthenticationError: Invalid Credentials"});
    }
  }
}));

suite.export(module);
