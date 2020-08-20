const fs = require('fs');
const ffmpeg = require('ffmpeg');
/**
 * Watch for any new *.webm files created since the function starts,
 * call transformation function on them.
 */

const watchDir = './';
const outputDir = './out';
const copyDir = '/media/pi/09C0-B4DC/';  // Location of Integral USB stick on Pi
// const copyDir = 'D:/Temp/';  // For testing on PC

const fileQueue = [];

// watchForNewFiles watches for new files. If new file extension ends
// in `extension`, then add the filename to the `queue`.
function watchForNewFiles(dir, extension, queue) {
  console.log('Watching for file changes')
  fs.watch(dir, (eventType, filename) => {
    if (filename) {
      if (eventType == 'rename' && filename.endsWith(extension)) {
        if (!queue.includes(filename)) {
          console.log(`Adding ${filename} to queue`);
          queue.push(filename);
        } else {
          console.log(`file ${filename} already exists on queue. doing nothing`);
        }
      } else {
        console.debug(`Ignoring file event type ${eventType} on file ${filename}`);
      }
    } else {
      console.debug('no filename');
    }
  });
}

// convertFile: transform the given file with ffmpeg
async function convertFile(filename) {
  console.log(`processing file ${filename}`);
  try {
    const video = await new ffmpeg(filename);
    
    // Use built-in options of node-ffmpeg
    video.setVideoFormat('mp4');
    video.setVideoFrameRate(30);
    // Use some custom commands to pass to ffmpeg
    // Set video bitrate for mp4 output file. The built-in function seemed to append a 'b' to the value which upset ffmpeg.
    video.addCommand('-b:v', '2500k' );
    // Add audio delay to output file in ms using an audio filter
    video.addCommand('-af', "adelay=100" );
    video.addCommand('-threads', '2');

    // console.debug(video.info_configuration);

    this.outFile = await video.save(`${outputDir}/video-${Date.now()}.mp4`);
    console.log(`File saved: ${outFile}`);

    if (!copyDir) {
      return
    }

    this.outFileName = this.outFile.split(/\//g).pop();
    // Copy the new mp4 file to the USB stick
    fs.copyFile(this.outFile, copyDir + this.outFileName , (err) => {
      if (err) {
        console.log(`Error copying file ${this.outFile} to ${copyDir}`);
      }
      else {
        console.log(`File ${this.outFile} copied to ${copyDir}${this.outFileName}`);
      }
    });

  } catch (e) {
    console.log(`Failed to process file: ${e.message}`);
  }

}

// processQueue: one at a time, take `filename`s from the queue
// and call `cb` on them.
async function processQueue(queue, cb) {
  while (true) {
    // If there are no files, wait for a bit and try again
    if (queue.length == 0) {
      await new Promise(r => setTimeout(r, 1000));
      continue
    }

    console.debug(`Queue has ${queue.length} files waiting`)
    const filename = queue.shift()
    console.debug(`Taken filename ${filename} off the queue to process`)
    await cb(filename)
  }
}

// If `dir` doesnt exist, create it.
function ensureDirExists(dir) {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
}


ensureDirExists(outputDir)
watchForNewFiles(watchDir, '.webm', fileQueue);
processQueue(fileQueue, convertFile)


