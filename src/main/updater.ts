import { autoUpdater } from 'electron-updater'
import { ipcMain, BrowserWindow, shell } from 'electron'

const RELEASE_URL = 'https://github.com/Gzbox/wechat-dual-launcher/releases/latest'

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

  // ── Key: disable auto-download ──
  // On macOS without code-signing, Squirrel/ShipIt cannot validate
  // downloaded updates (signature mismatch). Industry best practice
  // for unsigned apps: detect new versions, then redirect users to
  // GitHub Releases to manually download the new DMG.
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false

  autoUpdater.on('checking-for-update', () => {
    console.log('[updater] checking-for-update')
    safeSend(mainWindow, 'updater:message', 'Checking for update...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log('[updater] update-available', info)
    safeSend(mainWindow, 'updater:available', info)
  })

  autoUpdater.on('update-not-available', (info) => {
    console.log('[updater] update-not-available', info)
    safeSend(mainWindow, 'updater:not-available', info)
  })

  autoUpdater.on('error', (err) => {
    console.error('[updater] error', err)
    safeSend(mainWindow, 'updater:error', err.message || err.toString())
  })

  ipcMain.handle('updater:check', async () => {
    try {
      return await autoUpdater.checkForUpdates()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[updater] checkForUpdates threw:', msg)
      safeSend(mainWindow, 'updater:error', msg)
      return undefined
    }
  })

  // Open the GitHub Releases page in the user's default browser
  ipcMain.handle('updater:openReleasePage', () => {
    return shell.openExternal(RELEASE_URL)
  })
}
