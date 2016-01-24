"use strict";

function handlerMethod(server, request, reply) {
    server.log(["test"], {"message": "Hello Steve Wonder, it is you I'm looking for"});
    const name = typeof request.params.user === "undefined" ? "stranger" : request.params.user;
    return reply({
        "message": `Hello ${name}, is it me you're looking for?`
    });
}

module.exports = function(server) {
    return {
        "method": "GET",
        "path": "/hello/{user?}",
        "handler": handlerMethod.bind(null, server),
        "config": {
            "description": "Says hello",
            "notes": "{user} defaults to stranger if not provided.",
            "tags": ["api", "greeting", "secure"],

            "auth": "BasicAuthentication"
        }
    }
};
