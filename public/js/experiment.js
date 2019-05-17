var osc = new OSC();
osc.open({ host: '127.0.0.1', port: 8080 }); // connect by default to ws://localhost:8080
// var i =1; //init value
var mod = document.getElementById("dialog-modal");


// var reqmsg = new OSC.Message('/request_data', 'row');
// osc.send(reqmsg, { host: '127.0.0.1', port: 8080 });


setTimeout(function () {
  var reqmsg = new OSC.Message('/request_data', 'row');
  osc.send(reqmsg, { host: '127.0.0.1', port: 8080 });
}, 200);



var replaceTableLine = function(lineDataArray) {
    
    console.log(lineDataArray);
    if (lineDataArray === null) { // suppose that the loadDataLine function returns null when nothing is loaded, you can chose other returned values but you must handle the no data case   
      alert('there is no data in json');
      return;
    }
    
    
    var htmlLine = '<tr>' ; // this variable will contain the html line syntax to append te the table
    
    for (var key in lineDataArray) {
      htmlLine += '<td style="margin: 10px; padding: 5px;">' + lineDataArray[key] + '</td>'; // this is one td element of the line that contain the data element as text
    }
    
    // add the end of html line
    htmlLine += '</tr>';
    
    // remove existing lines from the html table
    $('table#infoTable tbody tr').remove();
    
    // append the new line
    $('table#infoTable tbody').append(htmlLine);
  }




$(document).ready(function(){
  var quesId = 0; // assign id to questionnaire

  $('#send').click(function(event) {
    //event.preventDefault();
    // send to the server the trust value 
    var trust = $('#slider1').val();
    console.log("slider val: "+ $('#slider1').val());

    // send message saying increment trial counter 
    var reqmsg = new OSC.Message('/next_trial', trust);
    osc.send(reqmsg, { host: '127.0.0.1', port: 8080 });

    /*// load the maintrial.html , Dave
      window.location.href="maintrial.html";*/
  });

/*  $('#radioValidate').click(function(){
      var allIsanswered = true;
      
      $('#quesTable tbody tr').each(function() {
          if ($(this).find('td input[type="radio"]:checked').length == 0) {
            allIsanswered = false;
          }
      });

      if (!allIsanswered) {
        alert('You have not answered all the questions');
      } else {
          var logArray = [];
          $('#quesTable tbody tr').each(function(){
              let question = $(this).find('td').first().text();
              var answer = $(this).find('td input[type="radio"]:checked').first().val();
              // suppose we have questionner id = 1 (we have to load data to detect which id 1 or 2)
              /*var quesId = 11;
              logArray.push(question + ', ' + answer + ', ' + quesId);
              
          });
          quesId++;
          console.log(logArray);
          StartExp();
        }
        
      });*/
});

/*osc.on('/post_task', message => {
    // go to post task
  var end = message.args[1]; //check if trials over
  var ai = message.args[0];  

if (end){
  console.log("trial ended" + message.args);  
  switch(ai){
    case "davebio":
      window.location.href="posttask1.html";
      break;
    case "mavechem":
      window.location.href="posttask2.html";
      break;
    case "javephy":
      window.location.href="posttask3.html";
      break;
    default:
      alert("error loading screen");
      break; 

  }
  var message = new OSC.Message('/init_trial', 'boo');
  osc.send(message, { host: '127.0.0.1', port: 8080 });
}

}); */

osc.on('/load_ai', message => {
   // added to load relevant page
  var ai = message.args[0];  
  var end = message.args[1];
//var info = "Transparent"; UNCOMMENT THIS to test
  switch(ai){
    case "davebio":
      if (end){
        console.log("first task has ended")
        window.location.href="posttask1.html";
      } else{
        console.log("still happening")
        window.location.href="maintrial.html"; }
      break;
    case "mavechem":
    if (end){
      console.log("second task has ended") // this gets executed after one trial
      window.location.href="posttask2.html";
      } else{
        window.location.href="trial2.html"; }
      break;
    case "javephy":
      if (end){
        window.location.href="posttask3.html";
      } else{
        window.location.href="trial3.html"; }
      break;
    default:
      alert("error loading screen");
      break;
  }
  //reset trial if ai =/= javephy
  if (!(ai === "javephy")){
    var message = new OSC.Message('/init_trial', 'finished ai', ai);
    osc.send(message, { host: '127.0.0.1', port: 8080 });
  }
});


osc.on('/data_requested', message => {
    // update the HTML TABLE
  replaceTableLine(message.args.slice(1,6));

  //update the title
  $("#name").text(message.args[0]);
    
});

osc.on('/ai_rec', message => {
  // todo
 var airec = message.args[0];  
  $("#reco").text(airec);

 var info = message.args[1]; //TODO: error, change this
 var delay = message.args[2];
 console.log(info);
  switch(info){
    case "Simple":
    //load simple screen
      var popupwin = window.open('http://localhost:8888/loadingsimple.html');
      setTimeout(function() { popupwin.close();}, delay);
      break;
    case "Transparent":
      var popupwin = window.open('http://localhost:8888/loadingtransp.html');
      setTimeout(function() { popupwin.close();}, delay);
      break;
    case "Entertaining":
      var popupwin = window.open('http://localhost:8888/loadingent.html');
      setTimeout(function() { popupwin.close();}, delay);
      break;
    default:
      alert("error")
      break;
  }
//alert better effect in Safari
  //alert("AI recommends to "+airec + " the candidate");
}); 


$("#ai").bind('click', function() {

    // create message - send user input
   // var selection = document.querySelector('input[name = "group1"]:checked').value; 
    var AIrun = Date.now(); 
    console.log("Run AI @ Time: "+ AIrun);
    var message = new OSC.Message('/request_ai', AIrun);
    // send message
    osc.send(message, { host: '127.0.0.1', port: 8080 });
// });
    //alert("user requested AI, selection: "+selection);
  $(this).toggle();

  $("#AIrec").show();
  $("#Submit").prop("disabled", false);
  
});

// Show the slider once Submit is clicked
function Show() {
        //$('#AI')
    document.getElementById('trust').style.display = "";

    var submitTime = Date.now();
    console.log("submit final decision Time: "+ submitTime);
}

var showFeedback = function(){
  
  alert("open feedback Modal: "+ i);
      // DISPLAY MODAL
  mod.style.display = "block";

}
  // remove existing lines from the html table
  /*$('table#fbTable tbody tr').remove();

osc.on('/open_loading_screen', message => {
  // todo
  //open loading screen 
  var info = message.args[0];  
  var airec = message.args[1];  
  console.log(info, airec);

//var info = "Transparent"; UNCOMMENT THIS to test
  switch(info){
    case "Simple":
    //load simple screen
      //new_popup();
      var popupwin = window.open('http://localhost:8888/loadingsimplel.html');
      setTimeout(function() { popupwin.close();}, 8000);
      break;
    case "Transparent":
      var popupwin = window.open('http://localhost:8888/loadingtranspl.html');
      setTimeout(function() { popupwin.close();}, 8000);
      break;
    case "Entertaining":
      var popupwin = window.open('http://localhost:8888/loadingentl.html');
      setTimeout(function() { popupwin.close();}, 8000);
      break;
    default:
      alert("error")
      break;
  }
*/

$("input:radio").change(function () 
{
  $("#ai").prop("disabled", false);
//logging the time and deciison
     var d = new Date();
     var selection = document.querySelector('input[name = "group1"]:checked').value;
     //TODO change to time the screen appears

     var selTime = Date.now(); 
     console.log("selection: "+ selection+ "@ selection Time: "+ selTime);
//add to dictionary of time and value

});

// To enable 'Next' once the slider is moved
// To enable 'Next' once the slider is moved
      $("#slider1").on("slideStop", function() {
        $(".MyButton").prop("disabled", null);
      });


/*$("#slider1").on("slideStop", function() {
  $("#send").prop("disabled", null);
  console.log("slider val: "+ $('#slider1').val());
});*/

// LOGGING

/*document.getElementById('inputradio').addEventListener('click', () => {
    var message = new OSC.Message('/inputradio', status);
    osc.send(message, { host: '127.0.0.1', port: 8080 });
});*/