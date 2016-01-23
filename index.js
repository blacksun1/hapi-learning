"use strict";

const Hapi = require("hapi");
const Q = require("q");
let counter = 1;

const server = new Hapi.Server();
server.connection({
	"host": "localhost",
	"port": 3000
});

const options = {
	"opsInterval": 1000,
	"reporters": [
		{
			"reporter": require("good-console"),
			"events": {
				"log": "*",
				"response": "*"
			}
		},
		{
			"reporter": require("good-file"),
			"events": {
				"response": "*"
			},
			"config": "./response.log"
		},
		{
			"reporter": require("good-file"),
			"events": {
				"log": "*"
			},
			"config": "./log.log"
		},
		{
			"reporter": require("good-file"),
			"events": {
				"ops": "*"
			},
			"config": "./ops.log"
		}
	]
};

server.route({
    "method": 'GET',
    "path": '/',
    "handler": function(request, reply) {
        server.log(["test"], {"message": "I really like cake"});
        reply(`<h1>Hello, world!</h1><p>Count is ${counter}</p>`);
        counter++;
    }
});

Q.ninvoke(server, "register", {
		register: require("good"),
		options: options
	})
	.then(Q.ninvoke(server, "start", () => {
		console.log(`Server with index ${process.env["NODE_APP_INSTANCE"]} running at: ${server.info.uri}`);
	}))
	.done();
