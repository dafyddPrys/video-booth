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
  console.log('watch for new files');
  fs.watch(dir, (eventType, filename) => {
    if (filename) {
      console.log(`File rename: ${filename}`);
      if (eventType == 'rename' && filename.endsWith(extension)) {
        console.log(`Got a new ${extension} file. Adding to queue`);
        queue.push(filename)
        console.log(queue)
      } else {
        console.log('file change');
      }
    } else {
      console.log('no filename');
    }
  });
}

// convertFile: transform the given file with ffmpeg
async function convertFile(filename) {
  console.log(`processing file ${filename}`);
  try {
    const video = await new ffmpeg(filename);
    // console.log(video.metadata);
    // console.log(video.info_configuration);
    
    // more options to set, need to learn what is available
    video.setVideoFormat('mp4');
    video.setVideoFrameRate(25);

    let outFile = await video.save(`${outputDir}/video-${Date.now()}.mp4`);
    console.log(`File saved: ${outFile}`);

  } catch (e) {
    console.log(`Failed to process file:`);
    console.log(e);
  }

}

// processQueue: one at a time, take `filename`s from the queue
// and call `cb` on them.
async function processQueue(queue, cb) {
  while (true) {
    // If there are no files, wait for a bit and try again
    if (queue.length == 0) {
      console.log('waiting')
      await new Promise(r => setTimeout(r, 1000));
      continue
    }

    const filename = queue.shift()
    console.log(`Waiting before processing ${filename}`)
    await new Promise(r => setTimeout(r, 3000));
    console.log('Done processing. queue now looks like')
    console.log(queue)
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


