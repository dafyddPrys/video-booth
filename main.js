// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');

// require('./lib/ipc.js')
require('./fileTransformer');

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'public/preload.js'),
      nodeIntegration:true,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// Config to stop deprecation message
app.allowRendererProcessReuse = true;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

/*
* IPC handlers
*/
ipcMain.on('download', saveVideoStreamToFile);

function saveVideoStreamToFile(event, args) {
  var buff = new Buffer.from(args.data, 'base64');
  const filename = `test-${Date.now()}.webm`;
  fs.writeFile(filename, buff, (err) => {
    if (err) {
      event.reply('download-reply', {
        success: false,
        error: err,
      });
    } else {
      event.reply('download-reply', {
        success: true
      });
    }
  });
}
