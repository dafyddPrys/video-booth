const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const { spawn } = require('child_process')
const fs = require('fs')
const port = 3000


app.use(bodyParser.json({ limit: '10mb' }))
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/home.html'));
});

app.post('/upload', (req, res) => {
  if (req.body) {
    saveVideoStreamToFile(req.body.data, (err) => {
      if (err) {
        console.log(err)
        res.sendStatus(500)
      } else {
        res.sendStatus(200)
      }
    });
  } else {
    res.sendStatus(400)
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});




function saveVideoStreamToFile(data, cb) {
  console.log("save video stream")
  var buff = new Buffer.from(data, 'base64');
  const filename = `test-${Date.now()}.webm`;
  return fs.writeFile(filename, buff, cb);
}


/**
 * Filetransformer child process
 */
const ft = spawn('node', ['fileTransformer.js'])

ft.stdout.on('data', (data) => {
  console.error(`filetransformer: ${data}`);
});

ft.stderr.on('data', (data) => {
  console.error(`filetransformer error: ${data}`);
});
