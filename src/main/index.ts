import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  detectWeChat,
  getInstances,
  createInstance,
  launchInstance,
  deleteInstance,
  updateInstance,
  checkRunning
} from './wechat'
import type { ProgressEvent } from './wechat'
import { setupUpdater } from './updater'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 760,
    height: 560,
    minWidth: 640,
    minHeight: 480,
    show: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#1e2030',
    ...(process.platform === 'linux' ? { icon } : {}),
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

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// ── IPC Handlers ──────────────────────────────────────

function registerIpcHandlers(): void {
  ipcMain.handle('wechat:detect', async () => {
    return detectWeChat()
  })

  ipcMain.handle('wechat:getInstances', async () => {
    return getInstances()
  })

  ipcMain.handle('wechat:create', async (event, name: string, suffix: string) => {
    const progressCallback = (progress: ProgressEvent): void => {
      event.sender.send('wechat:progress', progress)
    }
    await createInstance(name, suffix, progressCallback)
  })

  ipcMain.handle('wechat:launch', async (_event, appPath: string) => {
    await launchInstance(appPath)
  })

  ipcMain.handle('wechat:delete', async (_event, appPath: string) => {
    await deleteInstance(appPath)
  })

  ipcMain.handle('wechat:update', async (event, appPath: string) => {
    const progressCallback = (progress: ProgressEvent): void => {
      event.sender.send('wechat:progress', progress)
    }
    await updateInstance(appPath, progressCallback)
  })

  ipcMain.handle('wechat:checkRunning', async (_event, appPath: string) => {
    return checkRunning(appPath)
  })

  ipcMain.handle('app:getVersion', () => {
    return app.getVersion()
  })
}

// ── App Lifecycle ──────────────────────────────────────

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.wechatdual.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers()
  createWindow()

  // Initialize updater after window creation
  const mainWindow = BrowserWindow.getAllWindows()[0]
  if (mainWindow) {
    setupUpdater(mainWindow)
    // Check for updates automatically (optional, usually done after a delay)
    setTimeout(() => {
      // Import autoUpdater from electron-updater inside updater setup or just call IPC
      mainWindow.webContents.send('updater:trigger-check')
    }, 3000)
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
