const fs = require('fs');
const ffmpeg = require('ffmpeg');
/**
 * Watch for any new *.webm files created since the function starts,
 * call transformation function on them.
 */

const targetExtension = /.webm/;
const watchDir = './';
const outputDir = './out';

/**
 * Watch for new files
 */

function watchForNewFiles(dir, extension, callback) {
  console.log('watch for new files');
  fs.watch(dir, (eventType, filename) => {
    if (filename) {
      console.log(`File rename: ${filename}`);
      if (eventType == 'rename' && filename.endsWith(extension)) {
        console.log(`Got a new ${extension} file. processing`);
        callback(filename);
      } else {
        console.log('file change');
      }
    } else {
      console.log('no filename');
    }
  });
}

/**
* Transform the given file with ffmpeg
*/
async function webmToSomething(filename) {
  console.log(`processing file ${filename}`);
  try {
    const video = await new ffmpeg(filename);
    console.log(video.metadata);
    console.log(video.info_configuration);
    
    // Use built-in options of node-ffmpeg
    video.setVideoFormat('mp4');
    video.setVideoFrameRate(30);
	// Use some custom commands to pass to ffmpeg
	// Set video bitrate for mp4 output file. The built-in function seemed to append a 'b' to the value which upset ffmpeg.
	video.addCommand('-b:v', '2500k' );
	// Add audio delay to output file in ms using an audio filter
	video.addCommand('-af', "adelay=1000" );

    video.save(`./video-${Date.now()}.mp4`, (error, outputFile) => {
      if (error) {
        console.log(`error saving file: ${error}`);
      }
      console.log(`File saved: ${outputFile}`);
    });
  } catch (e) {
    console.log(`Failed to process file:`);
    console.log(e);
  }

}


watchForNewFiles(watchDir, '.webm', webmToSomething);


