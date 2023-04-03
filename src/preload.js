const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    retrieve_score: () => ipcRenderer.invoke("retrieve_score"), 
    get_app_version: () => ipcRenderer.invoke("get_app_version"),
})