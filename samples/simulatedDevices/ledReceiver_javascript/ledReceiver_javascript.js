'use strict';
var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;
var connectionString = '<your LED device ID>';
var client = clientFromConnectionString(connectionString);

// GPIO pin of the led
var wpi = require('wiringpi-node');
var configPin = 7;
wpi.setup('wpi');
wpi.pinMode(configPin, wpi.OUTPUT);
var isLedOn = 0;
var yellowColor = "\x1b[33m%s\x1b[0m:"; // yellow -telemetry to print only
var redColor = "\x1b[31m"; // red -urgent
var resetFontColor = "\x1b[0m";

function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}

var turnLedOn = function () {
    isLedOn = 1;
	wpi.digitalWrite(configPin, isLedOn );
    console.log(yellowColor, "LED's on", resetFontColor);
}

var turnLedOff = function () {
    console.log(redColor, "LED's off", resetFontColor);
    isLedOn = 0;
    wpi.digitalWrite(configPin, isLedOn );
}

/* App description: 
 * let 5V out on port 7 (GPIO4) to light up the connected LED when client receives message containing "motion detected!"
 * no voltage out on port 7 (GPIO4) to turn off the connected LED when client receives message containing "no motion" */
var connectCallback = function (err) {
    if (err) {
        console.log('Could not connect: ' + err);
    } else {
        console.log('Client connected');

        client.on('message', function (msg) {
            console.log(' Message: ' + msg.data);
            var msg_str = msg.data + ""
            if (msg_str.indexOf("motion detected!") > -1)    turnLedOn();
            else if (msg_str.indexOf("no motion") > -1)  turnLedOff();
            else turnLedOff();

            client.complete(msg, printResultFor('completed'));
        });
    }
};

client.open(connectCallback);
