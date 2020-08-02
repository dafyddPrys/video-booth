# Video booth
An application to record video messages, using electron and ffmpeg

## How I am running this
Running this on the pi under /home/pi/workspace/video-1
ssh onto it from vscode and see it work using vnc.

## Installation

Running on mac: `npm install --arch=x64`

Running on raspbian: `npm install --arch=armvl7` (or whatever the output of `uname -m` is)

### Whats going on
We're using a MediaRecorder to record raw video messages. Then we send these up to the "server" using electron's IPC feature. Once there, we write the data to a `.webm` file. 

We are also watching for new files to be created, which triggers ffmpeg to convert a new file to the desired output (see `fileTransformer.js`)
