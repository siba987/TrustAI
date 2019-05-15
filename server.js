//const fetch = require("node-fetch");
var http = require('http');
var fs = require('fs');
var path = require('path');
var express = require('express');
var osc_udp = require("osc");
var _ = require('underscore');
//var d3 = require('d3');
var app = require('express')()
/*var pino = require('express-pino-logger')()


app.use(pino)

app.get('/', function (req, res) {
  req.log.info('something')
  res.send('hello world')
})

app.listen(3000)*/

const port = 8888;

/* DEFINED AS GLOBAL TO SERVER */
var data = require('./experiment.json')
var trialsPerParticipant = _.groupBy(data, "Participant");

// console.log(trialsPerParticipant[0])

// csv("experiment_data.csv").then(function(data){
//     console.log('here');
//     console.log(data);
//     ctx.trials = data;})

// var app = express();
// var ctx ={
//     startTime:0,
//     cpt:0,

//     participantIndex:"Participant",
//     //candidateID:"candID",
//     blockIndex:"Block",
//     trialIndex:"Trial",
//     delayIndex:"D",
//     laborIndex:"I",
//     errorCount :0,
//     loggedTrials: [["Participant","TrialID","Block","Trial","D","L","ErrorCount"]],

// }


// START SERVER on 8888 (server)
// app.use(express.static('public'));
// app.get('/',function(req, res) {
//     res.sendFile(__dirname + '/index.html');
//     res.send()
// });

//
app.use(express.static('public'));
//app.use(express.static(__dirname + '/public'));


app.get('/experiment.json', function(req, res) {
  res.json(trialsPerParticipant);
});

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/index.html');
    res.send()
});
/*app.get('/maintrial.html', function(req, res) {
  res.sendFile(__dirname + '/maintrial.html');
});

app.get('/loadingsimplel.html', function(req, res) {
  res.sendFile(__dirname + '/loadingsimplel.html');
});
app.get('/loadingtranspl.html', function(req, res) {
  res.sendFile(__dirname + '/loadingtranspl.html');
});
app.get('/loadingentl.html', function(req, res) {
  res.sendFile(__dirname + '/loadingentl.html');
});*/

app.get('/Instructions1.html', function(req, res){
    res.sendFile(__dirname + '/Instructions1.html');
});
app.get('/Instructions2.html', function(req, res){
    res.sendFile(__dirname + '/Instructions2.html');
});
app.get('/loadingsimplel.html', function(req, res) {
  res.sendFile(__dirname + '/loadingsimplel.html');
});
app.get('/loadingtranspl.html', function(req, res) {
  res.sendFile(__dirname + '/loadingtranspl.html');
});
app.get('/loadingentl.html', function(req, res) {
  res.sendFile(__dirname + '/loadingentl.html');
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
//var idx = -1;
var idx=-1;
var participant = "";
var typeAI = '';
var loadingScreenCondition = '';
var delay = 3000; //chnage for long



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
  //startBlock = 0;
  //startTrial = 0;

//initial condition
// for(var i=0; i<trialsPerParticipant[participant].length; i++){
//     if (trialsPerParticipant[participant][i]['Participant'] == participant) {
//       if (trialsPerParticipant[participant][i]["Block"] == startBlock) {
//         if (trialsPerParticipant[participant][i]["Trial"] == startTrial) {
//           idx = i - 1;
//         }
//       }
//     }
//   }

  idx = 0; // idx = candidate
  loadingScreenCondition = trialsPerParticipant[participant][idx]["Info"];
  typeAI = trialsPerParticipant[participant][idx]["Uni"];; 

});

// send osc from browser to server, GETS PRINTED TO TERMINALdata[rowindex]['Candidate']

osc.on('/request_data', message => {
  //starting
  //idx++;  
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

// nextTrial()
osc.on('/next_trial', message => {
  idx++;
  if (idx == 14  ){
    //init conditions for next block
    idx = 0;
    loadingScreenCondition = trialsPerParticipant[participant][idx]["Info"];
    typeAI = trialsPerParticipant[participant][idx]["Uni"];
    console.log("load screen: "+loadingScreenCondition +", typeAI"+ typeAI);

    //go to post-ques
    
  }
  // console.log(trialsPerParticipant[participant][idx]['Candidate']);
  // console.log("info: "+trialsPerParticipant[participant][idx]["Info"]+", cand :" +trialsPerParticipant[participant][idx]["Candidate"]);
    var loadAI = new OSC.Message("/load_ai", typeAI, idx);
    osc.send(loadAI, {host:'127.0.0.1', port: 8080});
});


// check if value entered is correct, TODO
osc.on('/request_ai', message => {
  console.log(message)

  //console.log("par: "+partID + "trial: "+trial);
  var msgAiRec = new OSC.Message("/ai_rec", trialsPerParticipant[participant][idx]["AI recommendation"], loadingScreenCondition);
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

