import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { analyzeProject, getCandidateRules, applyFix } from './core/analyzer'
import type { RuleCandidate } from './core/types'

function createWindow(): void {
    const mainWindow = new BrowserWindow({
        width: 1100,
        height: 750,
        minWidth: 900,
        minHeight: 600,
        show: false,
        autoHideMenuBar: true,
        title: 'VTEX CSS Sanitizer',
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // HMR en desarrollo, URL de archivo en producción
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

// --- IPC Handlers ---

function registerIpcHandlers(): void {
    // Seleccionar carpeta
    ipcMain.handle('dialog:selectFolder', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
            title: 'Seleccionar proyecto VTEX IO'
        })
        if (result.canceled || result.filePaths.length === 0) return null
        return result.filePaths[0]
    })

    // Ejecutar análisis
    ipcMain.handle('analysis:run', async (_event, projectPath: string) => {
        try {
            return await analyzeProject(projectPath)
        } catch (error) {
            console.error('Error en análisis:', error)
            throw error
        }
    })

    // Obtener reglas candidatas para fix
    ipcMain.handle('fix:getCandidates', async (_event, projectPath: string) => {
        try {
            return await getCandidateRules(projectPath)
        } catch (error) {
            console.error('Error obteniendo candidatos:', error)
            throw error
        }
    })

    // Aplicar fix
    ipcMain.handle(
        'fix:apply',
        async (_event, projectPath: string, rulesToDelete: RuleCandidate[]) => {
            try {
                return await applyFix(projectPath, rulesToDelete)
            } catch (error) {
                console.error('Error aplicando fix:', error)
                throw error
            }
        }
    )

    // Abrir reporte en explorador de archivos
    ipcMain.handle('report:open', async (_event, reportPath: string) => {
        shell.showItemInFolder(reportPath)
    })
}

// --- App Lifecycle ---

app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.elilab.vtex-css-sanitizer')

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    registerIpcHandlers()
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
