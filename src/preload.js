const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    retrieveScores: () => ipcRenderer.invoke("retrieveScores"), 
    retrievePreference: () => ipcRenderer.invoke("retrievePreference"), 
    getAppVersion: () => ipcRenderer.invoke("getAppVersion"),
})