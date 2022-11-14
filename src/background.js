'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const path = require('path')

let cache_dir_path;
if(process.env.WEBPACK_DEV_SERVER_URL) { cache_dir_path = `${__dirname}/.cache` }
else { cache_dir_path = `${app.getPath('userData')}/.cache` }

const fs = require('fs')
const score_cache_filename = "score.json"
async function retrieve_score() {
  try {
    return JSON.parse(fs.readFileSync(`${cache_dir_path}/${score_cache_filename}`, 'utf8'))
  }
  catch(err) {
    console.log("Cache file not found. ")
    return undefined
  }
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 580,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION, 
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.setMenuBarVisibility(false)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // Save score. 
  try { fs.mkdirSync(cache_dir_path) }
  catch(err) {}
  if(score_data) {
    const score_data_str = JSON.stringify(score_data)
    fs.writeFileSync(`${cache_dir_path}/${score_cache_filename}`, score_data_str ? score_data_str : "")
    console.log(`Cache saved at ${cache_dir_path}/${score_cache_filename}. `)
  }

  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  ipcMain.handle('retrieve_score', retrieve_score)
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

let score_data = undefined

// Launch http server
const express = require('express')
const express_app = express()

const cors = require('cors')
// const corsOptions = {
//   origin: 'http://localhost:8080'
// }

express_app.use(express.json())
express_app.use(cors())

express_app.post('/api/get_score', (req, res) => {
  res.json(score_data)
})

express_app.post('/api/set_score', (req, res) => {
  score_data = req.body
  res.setHeader('Content-Type', 'text/html')
  res.send("OK")
})

express_app.listen(3000, () => {
  console.log("Listening on port 3000. ")
});