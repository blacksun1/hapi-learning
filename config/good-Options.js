"use strict";

module.exports = {
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