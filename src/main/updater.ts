import { autoUpdater, type UpdateInfo } from 'electron-updater'
import { ipcMain, BrowserWindow, shell } from 'electron'

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

  // Disable auto-download so the renderer controls when downloading starts.
  autoUpdater.autoDownload = false

  // Do NOT auto-install on quit — we handle updates via browser download
  // because unsigned macOS apps cannot use Squirrel.Mac's ShipIt installer.
  autoUpdater.autoInstallOnAppQuit = false

  autoUpdater.on('checking-for-update', () => {
    safeSend(mainWindow, 'updater:message', 'Checking for update...')
  })

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    // Send the version and release URL to the renderer
    const releaseUrl = `https://github.com/Gzbox/wechat-dual-launcher/releases/tag/v${info.version}`
    safeSend(mainWindow, 'updater:available', { ...info, releaseUrl })
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
    return autoUpdater.checkForUpdates()
  })

  ipcMain.handle('updater:download', () => {
    return autoUpdater.downloadUpdate()
  })

  ipcMain.handle('updater:quitAndInstall', () => {
    autoUpdater.quitAndInstall()
  })

  // Open external URL (for manual download fallback)
  ipcMain.handle('updater:openReleaseUrl', (_event, url: string) => {
    shell.openExternal(url)
  })
}
