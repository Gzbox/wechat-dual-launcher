import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export interface WeChatInfo {
  path: string
  version: string
  bundleId: string
}

export interface WeChatInstance {
  name: string
  appPath: string
  bundleId: string
  version: string
  isOriginal: boolean
  isRunning: boolean
}

export interface ProgressEvent {
  stage: string
  percent: number
  message: string
}

const api = {
  detectWeChat: (): Promise<WeChatInfo | null> => ipcRenderer.invoke('wechat:detect'),
  getInstances: (): Promise<WeChatInstance[]> => ipcRenderer.invoke('wechat:getInstances'),
  createInstance: (name: string, suffix: string): Promise<void> =>
    ipcRenderer.invoke('wechat:create', name, suffix),
  launchInstance: (path: string): Promise<void> => ipcRenderer.invoke('wechat:launch', path),
  deleteInstance: (path: string): Promise<void> => ipcRenderer.invoke('wechat:delete', path),
  updateInstance: (path: string): Promise<void> => ipcRenderer.invoke('wechat:update', path),
  checkRunning: (path: string): Promise<boolean> => ipcRenderer.invoke('wechat:checkRunning', path),
  onProgress: (callback: (event: ProgressEvent) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, event: ProgressEvent): void => {
      callback(event)
    }
    ipcRenderer.on('wechat:progress', handler)
    return () => ipcRenderer.removeListener('wechat:progress', handler)
  }
}

const updaterApi = {
  onMessage: (callback: (msg: string) => void): (() => void) => {
    const handler = (_: unknown, msg: string): void => callback(msg)
    ipcRenderer.on('updater:message', handler)
    return () => ipcRenderer.removeListener('updater:message', handler)
  },
  onAvailable: (callback: (info: unknown) => void): (() => void) => {
    const handler = (_: unknown, info: unknown): void => callback(info)
    ipcRenderer.on('updater:available', handler)
    return () => ipcRenderer.removeListener('updater:available', handler)
  },
  onNotAvailable: (callback: (info: unknown) => void): (() => void) => {
    const handler = (_: unknown, info: unknown): void => callback(info)
    ipcRenderer.on('updater:not-available', handler)
    return () => ipcRenderer.removeListener('updater:not-available', handler)
  },
  onError: (callback: (err: string) => void): (() => void) => {
    const handler = (_: unknown, err: string): void => callback(err)
    ipcRenderer.on('updater:error', handler)
    return () => ipcRenderer.removeListener('updater:error', handler)
  },
  onDownloadProgress: (callback: (progress: unknown) => void): (() => void) => {
    const handler = (_: unknown, progress: unknown): void => callback(progress)
    ipcRenderer.on('updater:download-progress', handler)
    return () => ipcRenderer.removeListener('updater:download-progress', handler)
  },
  onDownloaded: (callback: (info: unknown) => void): (() => void) => {
    const handler = (_: unknown, info: unknown): void => callback(info)
    ipcRenderer.on('updater:downloaded', handler)
    return () => ipcRenderer.removeListener('updater:downloaded', handler)
  },
  triggerCheck: (callback: () => void): (() => void) => {
    const handler = (): void => callback()
    ipcRenderer.on('updater:trigger-check', handler)
    return () => ipcRenderer.removeListener('updater:trigger-check', handler)
  },
  check: (): Promise<void> => ipcRenderer.invoke('updater:check'),
  download: (): Promise<void> => ipcRenderer.invoke('updater:download'),
  quitAndInstall: (): Promise<void> => ipcRenderer.invoke('updater:quitAndInstall')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('updaterApi', updaterApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.updaterApi = updaterApi
}
