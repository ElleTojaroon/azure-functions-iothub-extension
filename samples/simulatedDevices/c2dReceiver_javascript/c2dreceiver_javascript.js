'use strict';
var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;
var connectionString = '<your receiver device id>';
var client = clientFromConnectionString(connectionString);

function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}

/* More about c2d code at: 
 * https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-csharp-csharp-c2d#receive-messages-in-the-device-app */
var connectCallback = function (err) {
    if (err) {
        console.log('Could not connect: ' + err);
    } else {
        console.log('Client connected');

        client.on('message', function (msg) {                                                   
            console.log('Message: ' + msg.data);
            client.complete(msg, printResultFor('completed'));
        });
    }
};

client.open(connectCallback);