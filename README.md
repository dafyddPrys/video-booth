# Video booth
An application to record video messages, using express and ffmpeg

## How I am running this
Running this on the pi under /home/pi/workspace/video-1
ssh onto it from vscode and see it work using vnc.


### Whats going on
We're using a MediaRecorder to record raw video messages. Then we send these up to the express server as a base64 encoded string. Once there, we read the string into a Buffer and write it to a `.webm` file. 

A separate process watches for new `.webm` files, and queues them up for processing by ffmpeg (controlled via npm `ffmpeg` lib) to convert them to an mp4.

We then optionally copy the converted files to some media drive.
