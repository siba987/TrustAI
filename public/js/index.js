var osc = new OSC();
osc.open({ host: '127.0.0.1', port: 8080 }); // connect by default to ws://localhost:8080


setTimeout(function () {
  var reqmsg = new OSC.Message('/load_participants', 'start');
  osc.send(reqmsg, { host: '127.0.0.1', port: 8080 });
  }, 200);     

$(document).ready(function(){

	/*var jqxhr = $.getJSON("experiment.json", function(data) {
	  
      var allParticipantIds = _.keys(data); // [0,1,2,3,...,24]
      for(var i = 0; i < allParticipantIds.length; i++) { // or Object.keys(obj).length
        if(!(allParticipantIds[i] === participant)) {
           participant = i;
           $("select#participantSel").append('<option value="' + participant + '">Participant '+ participant +'</option>');
          }
        }
	}).error(function() { alert("error"); })*/

  osc.on('loaded', message => {
    var participant = message.args;
    $("select#participantSel").append('<option value="' + participant + '">Participant '+ participant +'</option>');
    console.log('parts loaded');
});

 $('#start').click(function(event) {
    event.preventDefault();
    participant = $('select#participantSel').val();
  	var message = new OSC.Message('/init_experiment', participant);
    osc.send(message, { host: '127.0.0.1', port: 8080 });

    // go to instructions
    window.location.href="Instructions1.html";
    //window.location.href="posttask3.html"; //start with Dave Bio

  });

});


var onchangeParticipant = function (){
	   participant = $('select#participantSel').val();
	   console.log("participant: "+participant)
};

// osc.on('/load_participants', message => {
//   console.log(message.args)

//   // TODO: PRINT ON THE SCREEN, FOR THE USERS
// })


