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
});

osc.on('/load_ai', message => {
   // added to load relevant page
  var ai = message.args[0];  
  var end = message.args[1]; //check if trials over
  console.log(ai);

//var info = "Transparent"; UNCOMMENT THIS to test
  switch(ai){
    case "davebio":
    //load simple screen
      //new_popup();
      if (end ==0){
        console.log("first task has ended")
        window.location.href="posttask1.html";
      } else{
        console.log("still happening")

        window.location.href="maintrial.html"; }
      break;
    case "javephy":
    if (end ==0){
      console.log("second task has ended")
      window.location.href="posttask2.html";
      } else{
      window.location.href="trial2.html"; }
      break;
    case "mavechem":
      if (end ==0){
        window.location.href="posttask1.html";
      } else{
      window.location.href="trial3.html"; }
      break;
    default:
      alert("error loading screen");
      break;
  }
    
});

osc.on('/post_task', message => {
    // go to post task
  
    
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

 var info = (message.args[1]); //TODO: error, change this
 console.log(info);
  switch(info){
    case "Simple":
    //load simple screen
      var popupwin = window.open('http://localhost:8888/loadingsimplel.html');
      setTimeout(function() { popupwin.close();}, 3000);
      break;
    case "Transparent":
      var popupwin = window.open('http://localhost:8888/loadingtranspl.html');
      setTimeout(function() { popupwin.close();}, 3000);
      break;
    case "Entertaining":
      var popupwin = window.open('http://localhost:8888/loadingentl.html');
      setTimeout(function() { popupwin.close();}, 3000);
      break;
    default:
      alert("error")
      break;
  }
//alert better effect in Safari
  //alert("AI recommends to "+airec + " the candidate");
}); 

    // send to the server the trust value 
    
    // send message saying increment trial counter 

    // load the maintrial.html 

//reset screen
   /* if (i!=0) {  
      $("#ai").toggle(); 
      $("#AIrec").toggle();
    }
    $( 'input[name = "group1"]' ).prop( "checked", false );*/
    
//pass index to data (in server.js)
  


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
$("#slider").on("slideStop", function() {
  $("#send").prop("disabled", null);
  console.log("slider val: "+ $('#slider1').val());
});

// LOGGING

/*document.getElementById('inputradio').addEventListener('click', () => {
    var message = new OSC.Message('/inputradio', status);
    osc.send(message, { host: '127.0.0.1', port: 8080 });
});*/