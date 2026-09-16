const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    getServerPort: () => ipcRenderer.invoke("getServerPort"), 
    retrieveScores: () => ipcRenderer.invoke("retrieveScores"), 
    retrievePreference: () => ipcRenderer.invoke("retrievePreference"), 
    getAppVersion: () => ipcRenderer.invoke("getAppVersion"),
})