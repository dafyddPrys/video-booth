/**
 * Logic for handling the mediaRecorder and upload to main process
 * should go in this file.
 */

const {ipcRenderer} = require('electron');

var recorder;
let recordedChunks = [];

// used to trigger functions in ui.js
var recorderStartedEvent = new Event('recorder-started');
var recorderStoppedEvent = new Event('recorder-stopped');

/**
 * Mime types, should be in order of preference.
 */
var types = [
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

ipcRenderer.on('download-reply', handleUploadReply);

/**
 * Recording logic
 */

/**
 * Called from mediaSelector.js
 * 
 * Initialise a MediaRecorder with the mediaStream and a compatible mime type.
 *
 * Get a reasonably high quality recording by setting the bitrate to 2.5Mb per sec 
 * in the options videoBitsPerSecond. It seemed to default to about 1Mb per sec otherwise.
 * Pi seems to ignore videoBitsPerSecond so trying bitsPerSecond as target for aggregate audio plus video
 */
function initRecorder(stream) {
    const firstCompatibleMimeType = types.find(t => MediaRecorder.isTypeSupported(t))
    console.log(`using mime type ${firstCompatibleMimeType}`);
    var options = { mimeType: firstCompatibleMimeType };

    recorder = new MediaRecorder(stream, options)
    recorder.ondataavailable = handleDataAvailable;

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
    reader.onload = () => {
        const b64 = reader.result.replace(/^data:.+;base64,/, '');
        ipcRenderer.send('download', {
            data: b64
        })
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

    await new Promise(r => setTimeout(r, 10000));
    if (recorder.state == 'recording') {
        stopRecorder();
    }
}

function stopRecorder() {
    window.dispatchEvent(recorderStoppedEvent);

    console.log('stopping');
    recorder.stop();
}

function handleUploadReply(event, arg) {
    if (arg.success) {
        console.log('video saved successfully')
        recordedChunks.shift() // remove the chunk that we've successfully saved
    } else {
        console.log('error saving video: ${arg.error}')
    }
}


/**
 * Check which mime types are supported
 */


for (var i in types) { 
    console.log(`Is ${types[i]} supported? ${MediaRecorder.isTypeSupported(types[i]) ? "Maybe" : "No"}`);
};