# OSC message JS <> Python

## Install 

Open one terminal window:
- `npm install`
- `node server.js` 

Open a second terminal window:
- `python3 server.py` (by default listening on port 5005, sending on port 5006)

Open brower, go to http://127.0.0.1:8888/ when pushing "click me" you should see some message in console (same values from python printout and console.log in the browser)

## Edits

- HTML: edit public/index.html
- JS: 
    - edit public/js/experiment.js (to get events and send data)
    - edit server.js to make the bridge from the browser-side events to python
- PYTHON:
    - server.py to deal with data communication
    - create your own python script that can be called in server.py

------------------------------------
### updated May 9
1. navigate to folder on computer
2. run: `node server.js` (browser -> server)
3. go to "http:/127.0.0.1:8888"

Add HTML files as needed, starting point as index.html (specified in code)
note: ENSURE that <script src="/js/osc.min.js"></script> is added to all html

## TODO
write function loadData()
modify two main js files (communication/ logging)

# Logging
## install pino
### (on Terminal)
node server.js | pino 
### (in script)
const app = require('express')()
const pino = require('express-pino-logger')()

app.use(pino)

app.get('/', function (req, res) {
req.log.info('expAI')
res.send('hello world')
})
app.listen(3000)

document.getElementById('inputradio').addEventListener('click', () => {
var message = new OSC.Message('/inputradio', status);
osc.send(message, { host: '127.0.0.1', port: 8080 });
});

 


