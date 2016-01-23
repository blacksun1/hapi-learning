"use strict";

const Hapi = require("hapi");
const Q = require("q");
let counter = 0;

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
            "config": "./logs/response.log"
        },
        {
            "reporter": require("good-file"),
            "events": {
                "log": "*"
            },
            "config": "./logs/log.log"
        },
        {
            "reporter": require("good-file"),
            "events": {
                "ops": "*"
            },
            "config": "./logs/ops.log"
        }
    ]
};

server.route({
    "method": 'GET',
    "path": "/",
    "handler": function(request, reply) {
        server.log(["test"], {"message": "I really like cake"});
        counter++;
        return reply({
            "message": "Hello, world!",
            "count": counter
        });
    }
});

server.route({
    "method": "GET",
    "path": '/hello/{user?}',
    "handler": function (request, reply) {
        const name = typeof request.params.user === "undefined" ? "" : ` ${request.params.user}`;
        return reply({
            "message": `Hello${name}, is it me you're looking for?`
        });
    }
});

Q(server.register({
        register: require("good"),
        options: options
    }))
    .then(() => server.start())
    .then(() => {
        console.log(`Server with index ${process.env["NODE_APP_INSTANCE"]} running at: ${server.info.uri}`);
    })
    .then(() => Q(null))
    .catch((err) => {
        console.log(`An error occured: ${err}`);
    })
    .done();
