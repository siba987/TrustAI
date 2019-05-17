//const fetch = require("node-fetch");
var http = require('http');
var fs = require('fs');
var path = require('path');
var express = require('express');
var osc_udp = require("osc");
var _ = require('underscore');
//var d3 = require('d3');
var app = require('express')()
const port = 8888;


/* DEFINED AS GLOBAL TO SERVER */
var data = require('./experiment.json')
var trialsPerParticipant = _.groupBy(data, "Participant");
// console.log(trialsPerParticipant[0])
//var allParticipantIds = _.keys(data); 

app.use(express.static('public'));
//app.use(express.static(__dirname + '/public'));


app.get('/experiment.json', function(req, res) {
  res.json(trialsPerParticipant);
});

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/index.html');
    res.send()
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`)
});



// OSC from server (NODE) to python 
var udpPort = new osc_udp.UDPPort({
    localAddress: "127.0.0.1",
    localPort: 5006, // This is the port the script is listening on
    remoteAddress: "127.0.0.1",
    remotePort: 5005, // This is where the msg are sent (where the python server is listening on)
    metadata: true
});


// Open the socket.
udpPort.open();

// OSC from browser to server through websockets
const OSC = require('osc-js')
const config = { udpClient: { host: '127.0.0.1', port: 5010 } }
const osc = new OSC({ plugin: new OSC.BridgePlugin(config) })
osc.open({ host: '127.0.0.1', port: 8080 }) // start a WebSocket server on port 8080


// logging IN DICTIONARY

var logger = {}; 
var idx = -1;
var endCondition = 0;
var trial = 0;
var participant = "";
var typeAI = '';
var loadingScreenCondition = '';
var delay = 3500; //chnage for long to 8000



// INIT logger when beginning the experiment
osc.on('/init_experiment', message => {
  logger = {}; 
  participant = message['args'];
  logger['participant'] = message['args'];  // keep the participatn id
  var currentdate = new Date(); 
  var datetime = currentdate.getFullYear() + "_" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate() + "-" +
                  + currentdate.getHours() + "-"  
                  + currentdate.getMinutes() + "-" 
                  + currentdate.getSeconds();
  logger['start_time'] = datetime;
  console.log(logger);
  
  // init trial, block
  startBlock = 0;
  startTrial = 0;

//initial condition
/*for(var i=0; i<trialsPerParticipant[participant].length; i++){
    if (trialsPerParticipant[participant][i]['Participant'] == participant) {
      if (trialsPerParticipant[participant][i]["Block"] == startBlock) {
        if (trialsPerParticipant[participant][i]["Trial"] == startTrial) {
          idx = i;
        }
      }
    }
  }*/

  idx = 0 ;  //idx = candidate-1
  trial = trialsPerParticipant[participant][idx]["Trial"]; //trial = candidate
  endCondition =0 ; //boolean to check condiiton finished
  loadingScreenCondition = trialsPerParticipant[participant][idx]["Info"];
  typeAI = trialsPerParticipant[participant][idx]["Uni"]; 
  
});

// send osc from browser to server, GETS PRINTED TO TERMINALdata[rowindex]['Candidate']
osc.on('load_participants', message => {
  var partID = "";
  var allParticipantIds = _.keys(trialsPerParticipant); // [0,1,2,3,...,24]
  console.log(allParticipantIds);
      for(var i = 0; i < allParticipantIds.length; i++) { // or Object.keys(obj).length
        if(!(allParticipantIds[i] == partID)) {
           partID = i;
           var loadpart = new OSC.Message("/loaded", partID);
           osc.send(loadpart, {host:'127.0.0.1', port: 8080});
           /*$("select#participantSel").append('<option value="' + participant + '">Participant '+ participant +'</option>');*/
          }
        }
});


osc.on('/request_data', message => {
   console.log("this is the trial: "+trial)
  var candidate = trialsPerParticipant[participant][idx]['Candidate'];
  var sub1 = trialsPerParticipant[participant][idx]['Sub 1'].toFixed(2);
  var sub2 = trialsPerParticipant[participant][idx]['Sub 2'].toFixed(2);
  var sub3 = trialsPerParticipant[participant][idx]['Sub 3'].toFixed(2);
  var final = trialsPerParticipant[participant][idx]['Final Year'].toFixed(2);
  var clubs = trialsPerParticipant[participant][idx]['Clubs'];

 // var values = [candidate, biology, chemistry];
  var message3 = new OSC.Message("/data_requested", candidate, sub1, sub2, sub3, final, clubs, loadingScreenCondition, typeAI);

  osc.send(message3, { host: '127.0.0.1', port: 8080 });
});

osc.on('/init_trial', message => {
  console.log("in init_trial: "+message);
  if (!(trialsPerParticipant[participant][idx]['Participant'] == participant)) {
    console.log("Experiment is over, thank you!");
   }

   endCondition =0 ; //boolean to check condiiton finished
  trial = trialsPerParticipant[participant][idx]["Trial"]; //trial = candidate
  loadingScreenCondition = trialsPerParticipant[participant][idx]["Info"];
  typeAI = trialsPerParticipant[participant][idx]["Uni"]; 
});

osc.on('/next_trial', message => {

    //console.log("partic ID: "+trialsPerParticipant[participant][idx]['Participant'] +", participant: "+participant);
    if ( (idx+1) %15 == 0){
        //go to post task
        endCondition =1;
         //init conditions for next block
    } 
    loadingScreenCondition = trialsPerParticipant[participant][idx]["Info"];
    typeAI = trialsPerParticipant[participant][idx]["Uni"];
    trial = trialsPerParticipant[participant][idx]["Trial"]; 

    idx ++;
    var loadAI = new OSC.Message("/load_ai", typeAI, endCondition);
    osc.send(loadAI, {host:'127.0.0.1', port: 8080});
    console.log("idx: "+ idx+", typeAI"+ typeAI);
    
});


// check if value entered is correct, TODO
osc.on('/request_ai', message => {
  console.log(message)

  //console.log("par: "+partID + "trial: "+trial);
  var msgAiRec = new OSC.Message("/ai_rec", trialsPerParticipant[participant][idx]["AI recommendation"], loadingScreenCondition, delay);
  osc.send(msgAiRec, {host:'127.0.0.1', port: 8080});
  
});


/*// Receiving OSC message and send it to browser
udpPort.on("ready", function () {
    var ipAddresses = ["127.0.0.1"]
    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log(" Host:", address + ", Port:", udpPort.options.localPort);
    });
});



udpPort.on("message", function (oscMessage) {
    console.log(oscMessage);
    var message = new OSC.Message(oscMessage.address, oscMessage['args'][0]['value']);
    osc.send(message, { host: '127.0.0.1', port: 8080 });
});*/


// // send osc from browser to server, GETS PRINTED TO CONSOLE

// osc.on('/require_data_for_part', message => {
//   console.log(message);
//   ctx.participantIndex = message['args'];
//   var message2 = new OSC.Message("/partic_data", data[ctx.participantIndex]['Candidate'],data[ctx.participantIndex]['Biology'], data[ctx.participantIndex]['Chemistry'], data[ctx.participantIndex]['Physics'], data[ctx.participantIndex]['Final Year'], data[ctx.participantIndex]['Clubs']);
//   osc.send(message2, { host: '127.0.0.1', port: 8080 });
// });
  
// osc.on('/set_current_part', message => {
//   ctx.participantIndex = message['args'];
//   //osc.send(message2, { host: '127.0.0.1', port: 8080 });
  
//   var msg = {
//         address: message['address'], // "/data",
//         args: message['args']
//     };
//     udpPort.send(msg);
//   var msg = {
//         address: message['address'], // "/data",
//         args: [
//             {
//                 type: "f",
//                 value: message['args']
//             },
//             {
//                 type: "f",
//                 value: message['args']
//             }
//         ]
//     };
//     udpPort.send(msg);
// });

// // send osc from browser to python
// osc.on('/reqAI', message => {
//   console.log(message)
//   var msg = {
//         address: message['address'], // "/data",
//         args: message['args']
//     };
//     udpPort.send(msg);
// })


// // Receiving OSC message and send it to browser
// udpPort.on("ready", function () {
//     var ipAddresses = ["127.0.0.1"]
//     console.log("Listening for OSC over UDP.");
//     ipAddresses.forEach(function (address) {
//         console.log(" Host:", address + ", Port:", udpPort.options.localPort);
//     });
// });



// udpPort.on("message", function (oscMessage) {
//     console.log(oscMessage);
//     var message = new OSC.Message(oscMessage.address, oscMessage['args'][0]['value']);
//     osc.send(message, { host: '127.0.0.1', port: 8080 });
// });

