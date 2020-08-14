const fs = require('fs');
const ffmpeg = require('ffmpeg');
/**
 * Watch for any new *.webm files created since the function starts,
 * call transformation function on them.
 */

const targetExtension = /.webm/;
const watchDir = './';
const outputDir = '.';

const fileQueue = [];

// watchForNewFiles watches for new files. If new file extension ends
// in `extension`, then add the filename to the `queue`.
function watchForNewFiles(dir, extension, queue) {
  fs.watch(dir, (eventType, filename) => {
    if (filename) {
      if (eventType == 'rename' && filename.endsWith(extension)) {
        console.log(`Adding ${filename} to queue`);
        queue.push(filename)
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
    
    // more options to set, need to learn what is available
    video.setVideoFormat('mp4');
    video.setVideoFrameRate(25);

    console.debug(video.info_configuration);

    let outFile = await video.save(`${outputDir}/video-${Date.now()}.mp4`);
    console.log(`File saved: ${outFile}`);

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
      console.debug('No files. Waiting')
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


