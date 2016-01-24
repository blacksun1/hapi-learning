"use strict";

const Hapi = require("hapi");
const Q = require("q");
const Bcrypt = require("bcrypt");
const glob = require("glob");
const path = require("path");

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
        // Setup authentication strategy
        server.auth.strategy("BasicAuthentication", "basic", {
            "validateFunc": validateUser
        });

        // Setup routes
        glob.sync("./routes/**/*.js").forEach(function(file) {
            const route = require(path.resolve(file))(server);
            server.log(["debug", "route"], {"message": "Initialising route", "route": {file, route}});
            server.route(route);
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
        console.error(err.stack);
        process.exit(1);
    })
    // Finish the promise chain
    .done();
