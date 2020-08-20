/**
 * Logic for handling the mediaRecorder and upload to main process
 * should go in this file.
 */

var recorder;
let recordedChunks = [];

/**
 * Mime types, should be in order of preference.
 */
var types = [
	"video/webm\;codecs=vp9,opus",
	// "video/webm\;codecs=vp8", //doesnt work on mac, but needed for pi
    "video/webm\;codecs=h264",
    "video/webm",
    "video/mpeg",
    "video/mp4",
];


// used to trigger functions in ui.js
var recorderStartedEvent = new Event('recorder-started');
var recorderStoppedEvent = new Event('recorder-stopped');

/**
 * Event handlers
 */
document.getElementById('record-stop').addEventListener('click', () => {
    console.log('record-stop: stop recorder')
    stopRecorder();
});

window.addEventListener('start-countdown-ended', () => {
    startRecorder();
});


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
    console.log(`using first compatible mime type ${firstCompatibleMimeType}`);
	var options = {
        mimeType: firstCompatibleMimeType,
        videoBitsPerSecond: 5000000,
        audioBitsPerSecond: 48000
    };
    
    recorder = new MediaRecorder(stream, options)
	console.log(`Video bitrate ${recorder.videoBitsPerSecond}`);
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
    console.log('uploading to main');
    const reader = new FileReader()
    reader.onload = function() {
        const b64 = reader.result.replace(/^data:.+;base64,/, '');

        const request = new XMLHttpRequest();
        request.open("POST", "/upload", true); // true => async
        request.setRequestHeader("Content-Type", "application/json; charset=UTF-8") // maybe?

        request.onreadystatechange = function() { // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE) {
                if (this.status === 200) {
                    console.log('Video delivered OK')
                } else {
                    console.error(`Not OK! Status: ${this.status}`)
                }
                // rm the latest chunk, regardless of whether it was successfully saved or not.
                recordedChunks.shift();
            }
        }

        request.send(JSON.stringify({
            data: b64,
        }));
    }

    reader.readAsDataURL(recordedChunks[0]); //readAsDataURL reads as base64 encoded string
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


    let time = 30;
    while (time >= 0) {
        if (recorder.state != 'recording') {
            console.log('stopped recording. ')
            break
        }
        if (time == 0) {
            console.log('startRecorder: stop recorder')
            stopRecorder();
            break
        }
        await new Promise(r => setTimeout(r, 1000));
        time--;
    }
}

function stopRecorder() {
    console.log('stopping recorder');
    window.dispatchEvent(recorderStoppedEvent);
    recorder.stop();
}



/**
 * Check which mime types are supported
 */
for (var i in types) { 
    console.log(`Is ${types[i]} supported? ${MediaRecorder.isTypeSupported(types[i]) ? "Maybe" : "No"}`);
};