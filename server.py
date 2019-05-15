import argparse
import random
import time

from pythonosc import osc_message_builder
from pythonosc import udp_client

from pythonosc import dispatcher
from pythonosc import osc_server


def handler(unused_addr, *args):    
    # do something with the data
    data = args[1:] # TODO: write python script, send data to classifier
    print("Receiving values:", data)
    # args[0] is the client, example send a random number when receiving something:
    message = {"address": "/python2browser", "value": random.random()} 
    args[0][0].send_message(message["address"], message["value"])
    print("sending: {} {}".format(message["address"], message["value"]))


if __name__ == "__main__":
    # parse arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("--ip", default="127.0.0.1", help="The ip of the server")
    parser.add_argument("--portin", type=int, default=5005, help="The port the server is listening on") #receives data
    parser.add_argument("--portout", type=int, default=5006, help="The port the server is sending to")
    args = parser.parse_args()
    
    # declare client, handling sending data
    client = udp_client.SimpleUDPClient(args.ip, args.portout)

    # handling received data
    dispatcher = dispatcher.Dispatcher()
    dispatcher.map("/browser2python", handler, client) 

    #TODO, refer to same or different handler
    dispatcher.map("/reqAI", handler, client)

    server = osc_server.ThreadingOSCUDPServer((args.ip, args.portin), dispatcher)
    print("Serving on {}".format(server.server_address))
    server.serve_forever()
