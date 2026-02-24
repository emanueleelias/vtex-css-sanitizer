import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// API personalizada expuesta al renderer
const api = {
    selectFolder: (): Promise<string | null> => ipcRenderer.invoke('dialog:selectFolder'),
    runAnalysis: (projectPath: string) => ipcRenderer.invoke('analysis:run', projectPath),
    getCandidates: (projectPath: string) => ipcRenderer.invoke('fix:getCandidates', projectPath),
    applyFix: (projectPath: string, rulesToDelete: unknown[]) =>
        ipcRenderer.invoke('fix:apply', projectPath, rulesToDelete),
    openReport: (reportPath: string) => ipcRenderer.invoke('report:open', reportPath)
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
}
