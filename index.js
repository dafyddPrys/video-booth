const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const express = require('express');
const bodyParser = require('body-parser');
const port = 3000;
const app = express();

// Videos came through at about 11MB, 30 to play it safe.
app.use(bodyParser.json({ limit: '30mb' }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/home.html'));
});

app.post('/upload', (req, res) => {
  if (req.body) {
    saveVideoDataToFile(req.body.data, (err) => {
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
  console.log(`listening at http://localhost:${port}`)
});


// Get the base64 encoded data, decode it and write to a file.
function saveVideoDataToFile(data, cb) {
  console.log("save video stream")
  var buff = new Buffer.from(data, 'base64');
  const filename = `test-${Date.now()}.webm`;
  return fs.writeFile(filename, buff, cb);
}


// Filetransformer child process
const ft = spawn('node', ['fileTransformer.js'])

ft.stdout.on('data', (data) => {
  console.log(`filetransformer: ${data}`);
});

ft.stderr.on('data', (data) => {
  console.error(`filetransformer error: ${data}`);
});
