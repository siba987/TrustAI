# OSC message JS <> Python

## Install 
### For Mac:
Open one terminal window:
1. navigate to folder on computer (ensure python installed)
2. run: 
- `npm install`
- `node server.js` 
3. Open browser, go to http://127.0.0.1:8888/ to start the experiment

note: ENSURE that <script src="/js/osc.min.js"></script> is added to all html

### For Windows:
* Ensure Python (v3.7.1) and node is installed on computer as described here: 
1. navigate to folder on computer
2. run cmd, same as above

## When runing the experiment
sign consent form
assign participant ID (make note)
set delay = long/ short in `server.js`
Press on F11 to enter full screen for experiment

## Logging
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

 


