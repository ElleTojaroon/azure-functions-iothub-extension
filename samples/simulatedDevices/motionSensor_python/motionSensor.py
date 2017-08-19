import random
import time
import sys
import iothub_client
import json
from iothub_client import IoTHubClient, IoTHubClientError, IoTHubTransportProvider, IoTHubClientResult
from iothub_client import IoTHubMessage, IoTHubMessageDispositionResult, IoTHubError, DeviceMethodReturnValue

from gpiozero import MotionSensor
pir = MotionSensor(4)

# String containing Hostname, Device Id & Device Key in the format
CONNECTION_STRING = '<>'
# choose HTTP, AMQP or MQTT as transport protocol
PROTOCOL = IoTHubTransportProvider.MQTT
MESSAGE_TIMEOUT = 10000
SEND_CALLBACKS = 0
msg_json = {
    "DeviceId": "<receiver device ID>"
}

def send_confirmation_callback(message, result, user_context):
    global SEND_CALLBACKS
    print ( "Confirmation[%d] received for message with result = %s" % (user_context, result) )
    map_properties = message.properties()
    print ( "    message_id: %s" % message.message_id )
    print ( "    correlation_id: %s" % message.correlation_id )
    key_value_pair = map_properties.get_internals()
    print ( "    Properties: %s" % key_value_pair )
    SEND_CALLBACKS += 1
    print ( "    Total calls confirmed: %d" % SEND_CALLBACKS )

def iothub_client_init():
    # prepare iothub client
    client = IoTHubClient(CONNECTION_STRING, PROTOCOL)
    # set the time until a message times out
    client.set_option("messageTimeout", MESSAGE_TIMEOUT)
    client.set_option("logtrace", 0)
    return client

def send_c2d_message_async(client, message_counter):
    msg_txt = json.dumps(msg_json)
    message = IoTHubMessage(msg_txt)

    client.send_event_async(message, send_confirmation_callback, message_counter)
    print ( "IoTHubClient.send_event_async accepted message for transmission to IoT Hub." )
    print ( "\033[92m " + msg_txt + " \x1b[0m" )

    status = client.get_send_status()
    print ( "Send status: %s" % status )
    time.sleep(5)

    status = client.get_send_status()
    print ( "Send status: %s" % status )

    message_counter += 1

def iothub_client_telemetry_sample_run():

    try:
        client = iothub_client_init()
        print ( "IoT Hub device sending periodic messages, press Ctrl-C to exit" )
        message_counter = 0

        while True:
            pir.wait_for_motion()
            msg_json["Message"] = "motion detected!"
            send_c2d_message_async(client, message_counter)
            
            pir.wait_for_no_motion()
            msg_json["Message"] = "no motion"
            send_c2d_message_async(client, message_counter)

    except IoTHubError as iothub_error:
        print ( "Unexpected error %s from IoTHub" % iothub_error )
        return
    except KeyboardInterrupt:
        print ( "IoTHubClient sample stopped" )

if __name__ == '__main__':
    print ( "Simulating a device using the Azure IoT Hub Device SDK for Python" )
    print ( "    Protocol %s" % PROTOCOL )
    print ( "    Connection string=%s" % CONNECTION_STRING )

    iothub_client_telemetry_sample_run()