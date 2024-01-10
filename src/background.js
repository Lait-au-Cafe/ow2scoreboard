'use strict'

import { app, protocol, Menu, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const fs = require('fs')
const path = require('path')

let cacheDirPath;
if(process.env.WEBPACK_DEV_SERVER_URL) { cacheDirPath = `${__dirname}/.cache` }
else { cacheDirPath = `${app.getPath('userData')}/.cache` }
try { fs.mkdirSync(cacheDirPath) }
catch(err) {
  if(err.code === 'EEXIST') { console.log("Cache directory exests. ") }
  else { console.log(err) }
}

const logFilename = "log.txt"
function log(msg, type) {
  const currentTime = new Date()
  const year = currentTime.getFullYear()
  const month = ("00" + currentTime.getMonth()).slice(-2)
  const day = ("00" + currentTime.getDate()).slice(-2)
  const hours = ("00" + currentTime.getHours()).slice(-2)
  const minutes = ("00" + currentTime.getMinutes()).slice(-2)
  const seconds = ("00" + currentTime.getSeconds()).slice(-2)
  const formattedDate = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`

  const line = `[${formattedDate}][${type}] ${msg}\n`
  fs.appendFileSync(`${cacheDirPath}/${logFilename}`, line)
}
fs.writeFileSync(`${cacheDirPath}/${logFilename}`, "")

function isVersionLessThan(target, reference) {
  let targetNumbers = target.split('.')
  let referenceNumbers = reference.split('.')
  // major
  if(targetNumbers[0] < referenceNumbers[0]) { return true }
  if(targetNumbers[0] > referenceNumbers[0]) { return false }
  // minor
  if(targetNumbers[1] < referenceNumbers[1]) { return true }
  if(targetNumbers[1] > referenceNumbers[1]) { return false }
  // patch
  if(targetNumbers[2] < referenceNumbers[2]) { return true }
  
  return false
}

function updateCacheFormat(cachedData) {
  let newCachedData = {}
  if(isVersionLessThan(cachedData.version, '2.2.0')) {
    if(cachedData.scores !== undefined) {
      newCachedData.scores = []
      for(let i=0; i < 3; i++) {
        newCachedData.scores[i] = {
          name: cachedData.scores[i].name, 
          isVisible: cachedData.scores[i].is_visible, 
          rank: {
            currentTier: cachedData.scores[i].rank.current_tier, 
            currentDivision: cachedData.scores[i].rank.current_division, 
          }, 
          score: {
            winLossDraws: cachedData.scores[i].score.win_loss_draws, 
            lastUpdated: cachedData.scores[i].score.lastUpdated, 
          }
        }
      }
    }
    if(cachedData.preference !== undefined) {
      newCachedData.preference = {
        display: {
          alignment: cachedData.preference.display.alignment, 
          intervalTime: {
            rankBadgeAndText: cachedData.preference.display.interval_time.rank_badge_text, 
            scoreTotalAndLatest: cachedData.preference.display.interval_time.score_total_latest,
          }, 
          backgroundOpacity: cachedData.preference.display.background_opacity, 
        }
      }
    }
  }
  else {
    // Up to date
    return cachedData
  }

  return newCachedData
}

const cacheFilename = "cache.json"
let cachedData = undefined
try {
  cachedData = JSON.parse(fs.readFileSync(`${cacheDirPath}/${cacheFilename}`, 'utf8'))
  console.log(`Cache file found: ${cacheDirPath}/${cacheFilename}. `)
  log(`Cache file found: ${cacheDirPath}/${cacheFilename}. (version ${cachedData.version})`, 'INFO')
  cachedData = updateCacheFormat(cachedData)
}
catch(err) {
  console.log("Cache file not found. ")
  log("Cache file not found. ", 'INFO')
}
console.dir(cachedData, {depth: null})

async function getAppVersion() {
  return app.getVersion()
}

const score_template = undefined;
function validateScoresData(score) {
  // TODO
  return score !== undefined
}

async function retrieveScores() {
  if(cachedData !== undefined && validateScoresData(cachedData['scores'])) {
    log(`Score cache found: ${cachedData['scores']}`, 'INFO')
    let retrievedScores = cachedData['scores']
    
    // string date to Date object
    for(let i = 0; i < retrievedScores.length; i++) {
      const date = retrievedScores[i].score.lastUpdated
      if(date) { retrievedScores[i].score.lastUpdated = new Date(date) }
    }
    
    return retrievedScores
  }

  log("Score cache not found. ", 'INFO')
  return undefined
}

const preference_template = undefined;
function validatePreference(preference) {
  // TODO
  return preference !== undefined
}

async function retrievePreference() {
  if(cachedData !== undefined && validatePreference(cachedData['preference'])) {
    log(`Preference cache found: ${cachedData['preference']}`, 'INFO')
    let retrievedPreference = cachedData['preference']
    return retrievedPreference
  }
  
  log("Preference cache not found. ", 'INFO')
  return undefined
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createMainWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 625,
    height: 750,
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
  (async () => {
    let cachedData = {};

    cachedData['version'] = await getAppVersion()
    if(currentScoresData) { cachedData['scores'] = currentScoresData }
    if(currentPreferenceData) { cachedData['preference'] = currentPreferenceData }

    const cachedData_str = JSON.stringify(cachedData)
    fs.writeFileSync(`${cacheDirPath}/${cacheFilename}`, cachedData_str ? cachedData_str : "")
    console.log(`Cache saved at ${cacheDirPath}/${cacheFilename}. `)
    log(`Cache saved at ${cacheDirPath}/${cacheFilename}. `, 'INFO')
  })();

  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
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
  ipcMain.handle('retrieveScores', retrieveScores)
  ipcMain.handle('retrievePreference', retrievePreference)
  ipcMain.handle('getAppVersion', getAppVersion)
  createMainWindow()
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

let currentScoresData = undefined
let currentPreferenceData = undefined

// Launch http server
const express = require('express')
const expressApp = express()

const cors = require('cors')
// const corsOptions = {
//   origin: 'http://localhost:8080'
// }

expressApp.use(express.json())
expressApp.use(cors())

expressApp.post('/api/get_score', (req, res) => {
  res.json(currentScoresData)
})
expressApp.post('/api/set_score', (req, res) => {
  currentScoresData = req.body
  res.setHeader('Content-Type', 'text/html')
  res.send("OK")
})

expressApp.post('/api/get_preference', (req, res) => {
  res.json(currentPreferenceData)
})
expressApp.post('/api/set_preference', (req, res) => {
  currentPreferenceData = req.body
  res.setHeader('Content-Type', 'text/html')
  res.send("OK")
})

expressApp.listen(3000, () => {
  console.log("Listening on port 3000. ")
  log("Listening on port 3000. ", 'INFO')
});