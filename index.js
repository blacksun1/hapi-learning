"use strict";

const Hapi = require("hapi");
const Q = require("q");
const Bcrypt = require("bcrypt");

let counter = 0;

const server = new Hapi.Server();
server.connection({
    "host": "localhost",
    "port": 3000
});

const users = {
    "john": {
        "username": "john",
        "password": "$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm",   // 'secret'
        "name": "John Doe",
        "id": "2133d32a"
    }
};

const validateUser = function(request, username, password, callback) {
    const user = users[username];
    if (!user) {
        return callback(null, false);
    }

    Bcrypt.compare(password, user.password, (err, isValid) => {
        callback(err, isValid, {
            "id": user.id,
            "name": user.name
        });
    });
};

// Register plugins
Q(server.register([
            // Install the Lout plugin to enable documentation
            // at `/docs/` (the route is configurable)
            require("vision"),
            require("inert"),
            {
                "register": require("lout")
            },
            // Install good logging support.
            {
                "register": require("good"),
                "options": require("./config/good-options")
            },
            // Auth
            require("hapi-auth-basic")
        ]))
    // Register routes
    .then(() => {
        server.auth.strategy("BasicAuthentication", "basic", {
            "validateFunc": validateUser
        });

        server.route({
            "method": "GET",
            "path": "/",
            "handler": function(request, reply) {
                server.log(["test"], {"message": "Hello World!"});
                counter++;
                return reply({
                    "message": "Hello, world!",
                    "counter": counter
                });
            },
            "config": {
                "description": "Hello World!",
                "notes": "Also returns an internal counter of the number of times the method has been called.",
                "tags": ["api", "secure"],

                "auth": "BasicAuthentication"
            }
        });

        server.route({
            "method": "GET",
            "path": "/hello/{user?}",
            "handler": function (request, reply) {
                const name = typeof request.params.user === "undefined" ? "stranger" : request.params.user;
                return reply({
                    "message": `Hello ${name}, is it me you're looking for?`
                });
            },
            "config": {
                "description": "Says hello",
                "notes": "{user} defaults to stranger if not provided.",
                "tags": ["api", "greeting", "secure"],

                "auth": "BasicAuthentication"
            }
        });

    })
    // Start the server
    .then(() => server.start())
    // Application is up and running. Output a message to the console
    .then(() => {
        console.log(`Server with index ${process.env["NODE_APP_INSTANCE"]} running at: ${server.info.uri}`);
    })
    // If HAPI doesn't start up then log it to the console.
    .catch((err) => {
        console.error(`[FATAL] An error occured: ${err}`);
        process.exit(1);
    })
    // Finish the promise chain
    .done();
