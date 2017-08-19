'use strict';
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client;

var connectionString = '<your receiver device id>';
var client = DeviceClient.fromConnectionString(connectionString, Mqtt);

/* direct method to be invoked from cloud */
function onWriteLine(request, response) {
    response.send(200, 'Input was written to log.', function (err) {
        if (err) {
            console.error('An error occurred when sending a method response:\n' + err.toString());
        } else {
            if (request.payload !== 'undefined') 
                console.log('Response to method \'' + request.methodName + "\' with Payload: \'" + request.payload.arg1 + '\' sent successfully.');
            else 
                console.log('Response to method \'' + request.methodName + '\' sent successfully.');
        }
    });
}

/* More about direct method receiver at: https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-csharp-node-direct-methods#create-a-simulated-device-app */
client.open(function (err) {
    if (err) {
        console.error('could not open IotHub client');
    } else {
        console.log('client opened');
        client.onDeviceMethod('writeLine', onWriteLine);
    }
});