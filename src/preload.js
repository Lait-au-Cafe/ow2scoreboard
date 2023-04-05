const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    retrieve_score: () => ipcRenderer.invoke("retrieve_score"), 
    retrieve_preference: () => ipcRenderer.invoke("retrieve_preference"), 
    get_app_version: () => ipcRenderer.invoke("get_app_version"),
})