import { autoUpdater } from 'electron-updater'
import { ipcMain, BrowserWindow } from 'electron'

export function setupUpdater(mainWindow: BrowserWindow): void {
  // We can set logger if needed
  autoUpdater.logger = console
  // autoUpdater.autoDownload = false // Set this if you want to prompt before downloading

  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('updater:message', 'Checking for update...')
  })

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('updater:available', info)
  })

  autoUpdater.on('update-not-available', (info) => {
    mainWindow.webContents.send('updater:not-available', info)
  })

  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('updater:error', err.message || err.toString())
  })

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('updater:download-progress', progressObj)
  })

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('updater:downloaded', info)
  })

  ipcMain.handle('updater:check', () => {
    autoUpdater.checkForUpdatesAndNotify()
  })

  ipcMain.handle('updater:download', () => {
    autoUpdater.downloadUpdate()
  })

  ipcMain.handle('updater:quitAndInstall', () => {
    autoUpdater.quitAndInstall()
  })
}
