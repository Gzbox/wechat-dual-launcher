import { ElectronAPI } from '@electron-toolkit/preload'

interface WeChatInfo {
  path: string
  version: string
  bundleId: string
}

interface WeChatInstance {
  name: string
  appPath: string
  bundleId: string
  version: string
  isOriginal: boolean
  isRunning: boolean
}

interface ProgressEvent {
  stage: string
  percent: number
  message: string
}

interface WeChatAPI {
  detectWeChat: () => Promise<WeChatInfo | null>
  getInstances: () => Promise<WeChatInstance[]>
  createInstance: (name: string, suffix: string) => Promise<void>
  launchInstance: (path: string) => Promise<void>
  deleteInstance: (path: string) => Promise<void>
  updateInstance: (path: string) => Promise<void>
  checkRunning: (path: string) => Promise<boolean>
  getVersion: () => Promise<string>
  onProgress: (callback: (event: ProgressEvent) => void) => () => void
}

interface UpdaterAPI {
  onMessage: (callback: (msg: string) => void) => () => void
  onAvailable: (callback: (info: unknown) => void) => () => void
  onNotAvailable: (callback: (info: unknown) => void) => () => void
  onError: (callback: (err: string) => void) => () => void
  onDownloadProgress: (callback: (progress: unknown) => void) => () => void
  onDownloaded: (callback: (info: unknown) => void) => () => void
  triggerCheck: (callback: () => void) => () => void
  check: () => Promise<void>
  download: () => Promise<void>
  quitAndInstall: () => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: WeChatAPI
    updaterApi: UpdaterAPI
  }
}
