const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    retrieve_score: () => ipcRenderer.invoke("retrieve_score")
})