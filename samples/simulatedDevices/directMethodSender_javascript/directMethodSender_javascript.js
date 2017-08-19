'use strict';
var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var connectionString = '<your sender device connection string>';
var client = clientFromConnectionString(connectionString);

function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}

/* Find out more about direct method code at: 
 * https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-csharp-node-direct-methods#create-a-simulated-device-app*/
var connectCallback = function (err) {
    if (err) {
        console.log('Could not connect: ' + err);
    } else {
        console.log('Client connected');

        // Create a message and send it to the IoT Hub every 5 seconds
        setInterval(function () {
            var isDirectMethod = true;
            var messageString = 'writeLine'; // method's name running on receiver's device that sender wants to invoke
            var receiverDeviceId = '<receiver device ID>';
            var fontColor = "\x1b[31m"; // red 

            var data = JSON.stringify({
                DeviceId: receiverDeviceId,
                Message: messageString
            });
            var message = new Message(data);
            
            console.log("Sending message: " + fontColor, message.getData(), "\x1b[0m"); // \x1b[0m: code to change back the font color
            client.sendEvent(message, printResultFor('send'));
        }, 5000);
    }
};

client.open(connectCallback);