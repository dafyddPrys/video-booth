/**
 * Logic for handling the mediaRecorder and upload to main process
 * should go in this file.
 */

// const {ipcRenderer} = require('electron');

var recorder;
let recordedChunks = [];

// used to trigger functions in ui.js
var recorderStartedEvent = new Event('recorder-started');
var recorderStoppedEvent = new Event('recorder-stopped');

/**
 * Mime types, should be in order of preference.
 */
var types = [
	"video/webm\;codecs=vp9,opus",
	"video/webm\;codecs=vp8", //doesnt work on mac, but needed for pi
    "video/webm\;codecs=h264",
    "video/webm",
    "video/mpeg",
    "video/mp4",
];

/**
 * Event handlers
 */
document.getElementById('record-start').addEventListener('click', startRecorder);
document.getElementById('record-stop').addEventListener('click', stopRecorder);

// ipcRenderer.on('download-reply', handleUploadReply);

/**
 * Recording logic
 */

/**
 * Called from mediaSelector.js
 * 
 * Initialise a MediaRecorder with the mediaStream and a compatible mime type.
 *
 * Not sure if the Pi camera takes any notice of the videoBitsPerSecond parameter.
 */
function initRecorder(stream) {
    const firstCompatibleMimeType = types.find(t => MediaRecorder.isTypeSupported(t))
    console.log(`using mime type ${firstCompatibleMimeType}`);
	var options = { mimeType: firstCompatibleMimeType , videoBitsPerSecond: 5000000, audioBitsPerSecond: 48000};

    recorder = new MediaRecorder(stream, options)
    recorder.ondataavailable = handleDataAvailable;
	console.log(`Video bitrate ${recorder.videoBitsPerSecond}`);

    return stream
}

/**
 * Do something when there are chunks available to send.
 * Each chunk is one video
 */
function handleDataAvailable(event) {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
      uploadToMain();
    } else {
      // do nothing? Not tested this scenario
      console.warn('No data in event, doing nothing')
    }
}

function uploadToMain() {
    const reader = new FileReader()
    reader.onload = async () => {
        const b64 = reader.result.replace(/^data:.+;base64,/, '');


        const request = new XMLHttpRequest();
        request.open("POST", "/upload", true);
        request.setRequestHeader("Content-Type", "application/json; charset=UTF-8") // maybe?


        request.onreadystatechange = function() { // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                // Request finished. Do processing here.
                console.log('OK');
                recordedChunks.shift() // remove the chunk that we've successfully saved
            } else {
                console.log(`Not OK: ${this.status}`)
            }
        }

        request.send(JSON.stringify({
            data: b64,
        }));
    }

    reader.readAsDataURL(recordedChunks[0]);
}

async function startRecorder() {
    window.dispatchEvent(recorderStartedEvent);

    if (!recorder) {
        console.log('no recorder, doing nothing')
        return
    }

    if (recorder.state != 'inactive') {
        console.log('recorder paused or active, doing nothing')
    }

    recorder.start()

    await new Promise(r => setTimeout(r, 30000));
    if (recorder.state == 'recording') {
        stopRecorder();
    }
}

function stopRecorder() {
    window.dispatchEvent(recorderStoppedEvent);

    console.log('stopping');
    recorder.stop();
}



/**
 * Check which mime types are supported
 */
for (var i in types) { 
    console.log(`Is ${types[i]} supported? ${MediaRecorder.isTypeSupported(types[i]) ? "Maybe" : "No"}`);
};