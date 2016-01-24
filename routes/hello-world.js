"use strict";

let counter = 0;

function handlerMethod(server, request, reply) {
    server.log(["test"], {"message": "Hello World!"});
    counter++;
    return reply({
        "message": "Hello, world!",
        "counter": counter
    });
}

module.exports = function(server) {
    return {
        "method": "GET",
        "path": "/",
        "handler": handlerMethod.bind(null, server),
        "config": {
            "description": "Hello World!",
            "notes": "Also returns an internal counter of the number of times the method has been called.",
            "tags": ["api", "secure"],

            "auth": "BasicAuthentication"
        }
    };
};
