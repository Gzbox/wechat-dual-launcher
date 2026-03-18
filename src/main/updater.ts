import { autoUpdater } from 'electron-updater'
import { ipcMain, BrowserWindow } from 'electron'

/**
 * Safely send an IPC message to the renderer.
 * Guards against sending to a destroyed or closed window,
 * which can happen if the user closes the app while an
 * auto-update event is still in-flight.
 */
function safeSend(window: BrowserWindow, channel: string, ...args: unknown[]): void {
  if (!window.isDestroyed()) {
    window.webContents.send(channel, ...args)
  }
}

export function setupUpdater(mainWindow: BrowserWindow): void {
  autoUpdater.logger = console

  autoUpdater.on('checking-for-update', () => {
    safeSend(mainWindow, 'updater:message', 'Checking for update...')
  })

  autoUpdater.on('update-available', (info) => {
    safeSend(mainWindow, 'updater:available', info)
  })

  autoUpdater.on('update-not-available', (info) => {
    safeSend(mainWindow, 'updater:not-available', info)
  })

  autoUpdater.on('error', (err) => {
    safeSend(mainWindow, 'updater:error', err.message || err.toString())
  })

  autoUpdater.on('download-progress', (progressObj) => {
    safeSend(mainWindow, 'updater:download-progress', progressObj)
  })

  autoUpdater.on('update-downloaded', (info) => {
    safeSend(mainWindow, 'updater:downloaded', info)
  })

  ipcMain.handle('updater:check', () => {
    return autoUpdater.checkForUpdatesAndNotify()
  })

  ipcMain.handle('updater:download', () => {
    return autoUpdater.downloadUpdate()
  })

  ipcMain.handle('updater:quitAndInstall', () => {
    autoUpdater.quitAndInstall()
  })
}
