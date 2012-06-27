var vows   = require("vows"),
    assert = require("assert"),
    cube   = require("../"),
    test   = require("./test");

var suite = vows.describe("authenticated-collector");

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

server.register = cube.collector.register;

server.start();

suite.addBatch(test.batch({
  "POST /event/put with valid credentials": {
    topic: test.request({method: "POST", port: port, path: "/1.0/event/put"}, JSON.stringify([{
      type: "test",
      time: new Date,
      user: "goodUser",
      password: "goodPassword",
      data: {
        foo: "bar"
      }
    }])),
    "responds with status 200": function(response) {
      assert.equal(response.statusCode, 200);
      assert.deepEqual(JSON.parse(response.body), {});
    }
  }
}));

suite.addBatch(test.batch({
  "POST /event/put with bad password": {
    topic: test.request({method: "POST", port: port, path: "/1.0/event/put"}, JSON.stringify([{
      type: "test",
      time: new Date,
      user: "goodUser",
      password: "badPassword",
      data: {
        foo: "bar"
      }
    }])),
    "responds with status 401": function(response) {
      assert.equal(response.statusCode, 401);
      assert.deepEqual(JSON.parse(response.body), {error: "AuthenticationError: Invalid Credentials"});
    }
  }
}));

suite.export(module);
