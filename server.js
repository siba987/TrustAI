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
/*var logger_block1 = {};
var logger_block2 = {};
var logger_block3 = {};*/
var arrayRadioButtonBlocks = [];
var key = '';
var blockId = 0;
var idx = -1;
var endCondition = 0;
var trial = 0;
var participant = "";
var typeAI = '';
var trust = 0;
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
  logger['delay_time'] = delay;
  console.log(logger);
  
  // init trial, block
 /* startBlock = 0;
  startTrial = 0;*/
  idx = 0 ;  //idx = candidate-1

  trial = trialsPerParticipant[participant][idx]["Trial"]; //trial = candidate
  endCondition = 0 ; //boolean to check condiiton finished
  loadingScreenCondition = trialsPerParticipant[participant][idx]["Info"];
  typeAI = trialsPerParticipant[participant][idx]["Uni"]; 

  logger['study'] = {
    'PreQuestionnaire1' : [],
    'Block1' : { }, // try as array
    'PostQuestionnaire1' : [],
    //'PreQuestionnaire2' : [],
    'Block2' : {},
    'PostQuestionnaire2' : [],
   // 'PreQuestionnaire3' : [],
    'Block3' : {},
    'PostQuestionnaire3' : [],
    'UsabilityQ': [],
    'Survey' : [] // or  {}
  }
  
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
  
  var candidate = trialsPerParticipant[participant][idx]['Candidate'];
  var sub1 = trialsPerParticipant[participant][idx]['Sub 1'].toFixed(2);
  var sub2 = trialsPerParticipant[participant][idx]['Sub 2'].toFixed(2);
  var sub3 = trialsPerParticipant[participant][idx]['Sub 3'].toFixed(2);
  var final = trialsPerParticipant[participant][idx]['Final Year'].toFixed(2);
  var clubs = trialsPerParticipant[participant][idx]['Clubs'];

 // var values = [candidate, biology, chemistry];
  var message3 = new OSC.Message("/data_requested", candidate, sub1, sub2, sub3, final, clubs, loadingScreenCondition, typeAI);

  osc.send(message3, { host: '127.0.0.1', port: 8080 });

  trial = trialsPerParticipant[participant][idx]["Trial"]; //trial = candidate
  loadingScreenCondition = trialsPerParticipant[participant][idx]["Info"];
  typeAI = trialsPerParticipant[participant][idx]["Uni"]; 

  var key = 'Block'+ String(blockId);
  console.log("this is the key: "+key)
/*  logger['study'][key] = {'start_time': datetime,
                          'trial': trial, 
                          'University': typeAI, 
                          'loadingScreenCondition': loadingScreenCondition};
*/
  arrayRadioButtonBlocks = [];
  
});

osc.on('/init_block', message => {
  //console.log("in init_trial: "+message);
  
  if (!(trialsPerParticipant[participant][idx]['Participant'] == participant)) {
    console.log("Experiment is over, thank you!");
   }

  endCondition = 0 ; //boolean to check condiiton finished
  arrayRadioButtonBlocks = [];
  trial = trialsPerParticipant[participant][idx]["Trial"]; //trial = candidate
  loadingScreenCondition = trialsPerParticipant[participant][idx]["Info"];
  typeAI = trialsPerParticipant[participant][idx]["Uni"]; 
  
});

osc.on('/next_trial', message => {

   loadingScreenCondition = trialsPerParticipant[participant][idx]["Info"];
    typeAI = trialsPerParticipant[participant][idx]["Uni"];
    trial = trialsPerParticipant[participant][idx]["Trial"]; 
    candidate = trialsPerParticipant[participant][idx]['Candidate'];
    //logging submit time
    currentdate = new Date(); 
    datetime = currentdate.getFullYear() + "_" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate() + "-" +
                  + currentdate.getHours() + "-"  
                  + currentdate.getMinutes() + "-" 
                  + currentdate.getSeconds();

   // idx ++;
    var loadAI = new OSC.Message("/load_ai", typeAI, endCondition);
    osc.send(loadAI, {host:'127.0.0.1', port: 8080});

    var key = 'Block'+ String(blockId);
    var trialKey = 'trial' + String(candidate);
    logger['study'][key][trialKey] = {'start_time': datetime,
                                    'Candidate': candidate, 
                                    'University': typeAI, 
                                    'loadingScreenCondition': loadingScreenCondition,
                                    'decisions': arrayRadioButtonBlocks,
                                    //'submit_time': submitDecision,
                                    'trust': message['args'][0]};

    if ( (idx+1) % 15 == 0){
        //go to post task
        endCondition = 1;
        var loadAI = new OSC.Message("/load_ai", typeAI, endCondition);
        osc.send(loadAI, {host:'127.0.0.1', port: 8080});
    
        logger['study'][key][trialKey] = {'start_time': datetime,
                                    'Candidate': candidate, 
                                    'University': typeAI, 
                                    'loadingScreenCondition': loadingScreenCondition,
                                    'decisions': arrayRadioButtonBlocks,
                                 //   'submit_time': submitDecision,
                                    'trust': message['args'][0]};

         //save file
          currentdate = new Date(); 
          var datetime = currentdate.getFullYear() + "_" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate() + "-" +
                  + currentdate.getHours() + "-"  
                  + currentdate.getMinutes() + "-" 
                  + currentdate.getSeconds();
          var filename = 'outputs/log_' + String(participant) + '_' + datetime + '.json';
          var json = JSON.stringify(logger);
          var fs = require('fs');
          fs.writeFile(filename, json, 'utf8',function(err) {
              if (err) throw err;
              console.log('complete block'+ blockId);
            }
          );
          
        //blockId++;
    } 
  // increment idx
  idx ++;
  arrayRadioButtonBlocks = [];
   
});


// check if value entered is correct, TODO
osc.on('/request_ai', message => {
  //console.log(message)
  currentdate = new Date(); 
  datetime = currentdate.getFullYear() + "_" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate() + "-" +
                  + currentdate.getHours() + "-"  
                  + currentdate.getMinutes() + "-" 
                  + currentdate.getSeconds();

  //console.log("par: "+partID + "trial: "+trial);
  var msgAiRec = new OSC.Message("/ai_rec", trialsPerParticipant[participant][idx]["AI recommendation"], loadingScreenCondition, delay);
  osc.send(msgAiRec, {host:'127.0.0.1', port: 8080});

  arrayRadioButtonBlocks.push(['ai', trialsPerParticipant[participant][idx]["AI recommendation"], datetime]);
  console.log(arrayRadioButtonBlocks)
  
});

// user's radio input
osc.on('/inputradio', message => {
  currentdate = new Date(); 
  datetime = currentdate.getFullYear() + "_" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate() + "-" +
                  + currentdate.getHours() + "-"  
                  + currentdate.getMinutes() + "-" 
                  + currentdate.getSeconds();
  //logger['radio_time'] = datetime;
  //logger['Your Decision'] = message.args;
  arrayRadioButtonBlocks.push(['user', message.args[0], datetime]);
  console.log(arrayRadioButtonBlocks); //prints the history, appended

});

osc.on('/submit_decision', message=> {
  currentdate = new Date(); 
  datetime = currentdate.getFullYear() + "_" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate() + "-" +
                  + currentdate.getHours() + "-"  
                  + currentdate.getMinutes() + "-" 
                  + currentdate.getSeconds();
  
  arrayRadioButtonBlocks.push(['submit_decision', datetime]);
  console.log(arrayRadioButtonBlocks); 
});


// PreQuestionnaire1
osc.on('/PreQuestionnaire1', message => {
  let quesId = message['args'][0];
  let question = message['args'][1];
  let answer = message['args'][2];
  //logger['study']['PreQuestionnaire1'].push([quesId, question, answer]);
  
  logger['study']['PreQuestionnaire1'].push({ 'Q_id': quesId,
                                                   'Statement': question, 
                                                   'Rating': answer});
});

osc.on('/PreQuestionnaire1_done', message => {
  currentdate = new Date(); 
  datetime = currentdate.getFullYear() + "_" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate() + "-" +
                  + currentdate.getHours() + "-"  
                  + currentdate.getMinutes() + "-" 
                  + currentdate.getSeconds();
  var filename = 'outputs/log_' + String(participant) + '_' + datetime + '.json';
  var json = JSON.stringify(logger);
  var fs = require('fs');
  fs.writeFile(filename, json, function(err) {
    if (err) throw err;
    console.log('complete preques');
    });
  blockId = 1;
  
});

osc.on('/PostQuestionnaire1', message => {
  // TOOD
  let quesId = message['args'][0];
  let question = message['args'][1];
  let answer = message['args'][2];
  let trust = message['args'][3];
 
  logger['study']['PostQuestionnaire1'][0] = {'overall_trust': trust};

  logger['study']['PostQuestionnaire1'].push({ 'Q_id': quesId,
                                                   'Statement': question, 
                                                   'Rating': answer});
});

//
osc.on('/PostQuestionnaire1_done', message => {
  currentdate = new Date(); 
  datetime = currentdate.getFullYear() + "_" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate() + "-" +
                  + currentdate.getHours() + "-"  
                  + currentdate.getMinutes() + "-" 
                  + currentdate.getSeconds();
  var filename = 'outputs/log_' + String(participant) + '_' + datetime + '.json';
  var json = JSON.stringify(logger);
  var fs = require('fs');
  fs.writeFile(filename, json, function(err) {
    if (err) throw err;
    console.log('complete postques');
    }
);
   blockId = 2;
});


// PreQuestionnaire2
/*osc.on('/PreQuestionnaire2', message => {
  let question = message['args'][0];
  let answer = message['args'][1];
  let quesId = message['args'][2];
  //logger['study']['PreQuestionnaire2'].push([quesId, question, answer]);
  var count = String(i);
  logger['study']['PreQuestionnaire2'][count] = {'Q_id': quesId,
                                                 'Statement': question, 
                                                 'Rating': answer};
  i ++;
});

osc.on('/PreQuestionnaire2_done', message => {
  currentdate = new Date(); 
  datetime = currentdate.getFullYear() + "_" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate() + "-" +
                  + currentdate.getHours() + "-"  
                  + currentdate.getMinutes() + "-" 
                  + currentdate.getSeconds();
  var filename = 'outputs/log_' + String(participant) + '_' + datetime + '.json';
  var json = JSON.stringify(logger);
  var fs = require('fs');
  fs.writeFile(filename, json, function(err) {
    if (err) throw err;
    console.log('complete preques');
    }
);
  blockId = 2;
  i = 1;
});*/


osc.on('/PostQuestionnaire2', message => {
  // TOOD
  let quesId = message['args'][0];
  let question = message['args'][1];
  let answer = message['args'][2];
  let trust = message['args'][3];
  /*logger['study']['PostQuestionnaire2']['overall_trust']= trust;
  logger['study']['PostQuestionnaire2'].push([quesId, question, answer]);*/
  
  logger['study']['PostQuestionnaire2'][0] = {'overall_trust': trust};

  logger['study']['PostQuestionnaire2'].push({ 'Q_id': quesId,
                                                   'Statement': question, 
                                                   'Rating': answer});
});


osc.on('/PostQuestionnaire2_done', message => {
  currentdate = new Date(); 
  datetime = currentdate.getFullYear() + "_" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate() + "-" +
                  + currentdate.getHours() + "-"  
                  + currentdate.getMinutes() + "-" 
                  + currentdate.getSeconds();
  var filename = 'outputs/log_' + String(participant) + '_' + datetime + '.json';
  var json = JSON.stringify(logger);
  var fs = require('fs');
  fs.writeFile(filename, json, function(err) {
    if (err) throw err;
    console.log('complete postques');
    }
);
   blockId = 3;
});

// PreQuestionnaire3
osc.on('/PostQuestionnaire3', message => {
  // TOOD
  let quesId = message['args'][2];
  let question = message['args'][0];
  let answer = message['args'][1];
  let trust = message['args'][3];
  /*logger['study']['PostQuestionnaire3']['overall_trust']= trust;
  logger['study']['PostQuestionnaire3'].push([quesId, question, answer]);*/
 
  logger['study']['PostQuestionnaire3'][0] = {'overall_trust': trust};

  logger['study']['PostQuestionnaire3'].push({ 'Q_id': quesId,
                                                   'Statement': question, 
                                                   'Rating': answer});
  
});


osc.on('/PostQuestionnaire3_done', message => {
  currentdate = new Date(); 
  datetime = currentdate.getFullYear() + "_" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate() + "-" +
                  + currentdate.getHours() + "-"  
                  + currentdate.getMinutes() + "-" 
                  + currentdate.getSeconds();
  var filename = 'outputs/log_' + String(participant) + '_' + datetime + '.json';
  var json = JSON.stringify(logger);
  var fs = require('fs');
  fs.writeFile(filename, json, function(err) {
    if (err) throw err;
    console.log('complete postques3, go to feedback');
    }
);
   //blockId = 0;
});
/*osc.on('/PreQuestionnaire3', message => {
  let quesId = message['args'][0];
  let question = message['args'][1];
  let answer = message['args'][2];
  //logger['study']['PreQuestionnaire3'].push([quesId, question, answer]);
  var count = String(i);
  logger['study']['PreQuestionnaire3'][count] = {'Q_id': quesId,
                                                 'Statement': question, 
                                                 'Rating': answer};
  i ++;
});

osc.on('/PreQuestionnaire3_done', message => {
  currentdate = new Date(); 
  datetime = currentdate.getFullYear() + "_" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate() + "-" +
                  + currentdate.getHours() + "-"  
                  + currentdate.getMinutes() + "-" 
                  + currentdate.getSeconds();
  var filename = 'outputs/log_' + String(participant) + '_' + datetime + '.json';
  var json = JSON.stringify(logger);
  var fs = require('fs');
  fs.writeFile(filename, json, function(err) {
    if (err) throw err;
    console.log('complete preques');
    }
);
  blockId = 3;
});*/

osc.on('/usability', message => {

  let bestAI = message['args'][0];
  
   logger['study']['UsabilityQ'].push(['Best AI', bestAI]);
   console.log('this is the best!')
  
});

osc.on('/usability2', message => {

  let id = message['args'][0];
  let answer = message['args'][1];
  
  logger['study']['UsabilityQ'].push([id, answer]); 
  
});


osc.on('/survey', message => {
  var logArray = [];
  let Q_id = message['args'][0];
  let ans = message['args'][1];
  let gender = message['args'][2];
  let level_study = message['args'][3];
  /*logger['study']['Survey'] =   {   'gender': gender, 
                                    'study' : study,
                                    "Q&A": logArray };*/
  logger['study']['Survey'][0] = {'Gender':gender, 'Level of study':level_study}; //do once
  logger['study']['Survey'].push([Q_id, ans]);
});

osc.on('/surv_done', message => {
  currentdate = new Date(); 
  datetime = currentdate.getFullYear() + "_" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate() + "-" +
                  + currentdate.getHours() + "-"  
                  + currentdate.getMinutes() + "-" 
                  + currentdate.getSeconds();
  var filename = 'outputs/log_' + String(participant) + '_' + datetime + '.json';
  var json = JSON.stringify(logger);
  var fs = require('fs');
  fs.writeFile(filename, json, function(err) {
    if (err) throw err;
    console.log('complete survey');
    }
  );
});


/*// Summary data
osc.on('/summary_data', message => {
  //check part
  console.log(participant);
  var part_ID = participant;
  //var your_decision = 'Accept';
  var message3 = new OSC.Message("/summarydata_requested", part_ID);

    osc.send(message3, { host: '127.0.0.1', port: 8080 });
  
});*/


