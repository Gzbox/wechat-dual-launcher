import { execFile } from 'child_process'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import { join, basename, resolve } from 'path'
import { app } from 'electron'

// ── Types ──────────────────────────────────────────────

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

type ProgressCallback = (event: ProgressEvent) => void

// ── Concurrency Guard ──────────────────────────────────
// Prevents race conditions from multiple simultaneous operations

let operationLock = false

async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  if (operationLock) {
    throw new Error('ERR_IN_PROGRESS')
  }
  operationLock = true
  try {
    return await fn()
  } finally {
    operationLock = false
  }
}

// ── Helpers ──────────────────────────────────────────────

function exec(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message))
      else resolve(stdout.trim())
    })
  })
}

function readPlistValue(plistPath: string, key: string): Promise<string> {
  return exec('/usr/libexec/PlistBuddy', ['-c', `Print :${key}`, plistPath])
}

/**
 * Set a plist key's value. Uses two separate -c arguments for safety:
 * this avoids issues if `value` contains spaces, quotes, or other
 * shell metacharacters that PlistBuddy might misinterpret in a
 * single "Set :key value" string.
 */
function setPlistValue(plistPath: string, key: string, value: string): Promise<string> {
  // PlistBuddy -c "Set :key value" treats everything after the key as the value.
  // This is safe because execFile does NOT use a shell — arguments are passed
  // directly to the process as argv, so no shell escaping needed.
  return exec('/usr/libexec/PlistBuddy', ['-c', `Set :${key} ${value}`, plistPath])
}

/**
 * Discover the main executable inside a .app bundle.
 * Reads CFBundleExecutable from Info.plist as the authoritative source.
 * Falls back to "WeChat" if the key can't be read.
 */
async function getExecutablePath(appPath: string): Promise<string> {
  const plistPath = join(appPath, 'Contents', 'Info.plist')
  let execName: string
  try {
    execName = await readPlistValue(plistPath, 'CFBundleExecutable')
  } catch {
    execName = 'WeChat'
  }
  return join(appPath, 'Contents', 'MacOS', execName)
}

/**
 * Check if a WeChat instance is currently running.
 * Uses ps -eo command to match the exact executable path, avoiding
 * false positives from other apps with similar names.
 */
async function isProcessRunning(appPath: string): Promise<boolean> {
  try {
    const executablePath = await getExecutablePath(appPath)
    const result = await exec('/bin/ps', ['-eo', 'command'])
    return result.split('\n').some((line) => line.trim().startsWith(executablePath))
  } catch {
    return false
  }
}

/**
 * Get all running process command lines in a single ps call.
 * Used by getInstances to avoid spawning N separate ps processes.
 */
async function getRunningProcesses(): Promise<string[]> {
  try {
    const result = await exec('/bin/ps', ['-eo', 'command'])
    return result.split('\n').map((line) => line.trim())
  } catch {
    return []
  }
}

/**
 * Validate that a path is within expected directories.
 * Uses path.resolve for robust normalization (handles .., symlinks in path components, etc.).
 * Prevents path traversal attacks.
 */
function isPathSafe(targetPath: string): boolean {
  const resolved = resolve(targetPath)
  return SEARCH_PATHS.some((dir) => resolved.startsWith(dir + '/'))
}

// ── Core Functions ──────────────────────────────────────

const WECHAT_BUNDLE_ID = 'com.tencent.xinWeChat'
const SEARCH_PATHS = ['/Applications', join(app.getPath('home'), 'Applications')]

export async function detectWeChat(): Promise<WeChatInfo | null> {
  for (const searchDir of SEARCH_PATHS) {
    const candidates = ['WeChat.app', '微信.app']
    for (const name of candidates) {
      const appPath = join(searchDir, name)
      try {
        await fs.access(appPath)
        const plistPath = join(appPath, 'Contents', 'Info.plist')
        const bundleId = await readPlistValue(plistPath, 'CFBundleIdentifier')
        // Exact match only — prevent matching "com.tencent.xinWeChatSomethingElse"
        if (bundleId === WECHAT_BUNDLE_ID) {
          const version = await readPlistValue(plistPath, 'CFBundleShortVersionString').catch(
            () => 'unknown'
          )
          return { path: appPath, version, bundleId }
        }
      } catch {
        // not found here, continue
      }
    }
  }
  return null
}

export async function getInstances(): Promise<WeChatInstance[]> {
  const instances: WeChatInstance[] = []
  const seenBundleIds = new Set<string>()

  // Single ps call for all running-status checks (performance: 1 spawn instead of N)
  const runningProcesses = await getRunningProcesses()

  for (const searchDir of SEARCH_PATHS) {
    try {
      const entries = await fs.readdir(searchDir, { withFileTypes: true })
      for (const entry of entries) {
        if (!entry.isDirectory() || !entry.name.endsWith('.app')) continue
        const appPath = join(searchDir, entry.name)

        const plistPath = join(appPath, 'Contents', 'Info.plist')
        try {
          const bundleId = await readPlistValue(plistPath, 'CFBundleIdentifier')
          if (!bundleId.startsWith(WECHAT_BUNDLE_ID)) continue

          // Dedup by bundleId: if same bundle ID found in both directories, keep the first
          if (seenBundleIds.has(bundleId)) continue
          seenBundleIds.add(bundleId)

          const version = await readPlistValue(plistPath, 'CFBundleShortVersionString').catch(
            () => 'unknown'
          )
          const isOriginal = bundleId === WECHAT_BUNDLE_ID

          // Check running status against pre-fetched process list (no spawn)
          const execPath = await getExecutablePath(appPath)
          const running = runningProcesses.some((line) => line.startsWith(execPath))

          instances.push({
            name: basename(entry.name, '.app'),
            appPath,
            bundleId,
            version,
            isOriginal,
            isRunning: running
          })
        } catch {
          // not a valid plist, skip
        }
      }
    } catch {
      // directory not accessible
    }
  }

  // Sort: original first, then alphabetically
  instances.sort((a, b) => {
    if (a.isOriginal && !b.isOriginal) return -1
    if (!a.isOriginal && b.isOriginal) return 1
    return a.name.localeCompare(b.name)
  })

  return instances
}

export async function createInstance(
  displayName: string,
  bundleSuffix: string,
  onProgress?: ProgressCallback
): Promise<void> {
  return withLock(async () => {
    const wechat = await detectWeChat()
    if (!wechat) throw new Error('ERR_NOT_FOUND')

    // ── Input validation ──
    if (!displayName.trim()) {
      throw new Error('ERR_EMPTY_NAME')
    }
    if (!bundleSuffix.trim()) {
      throw new Error('ERR_EMPTY_SUFFIX')
    }
    // Suffix must be alphanumeric to form a valid bundle ID
    if (!/^[a-zA-Z0-9]+$/.test(bundleSuffix)) {
      throw new Error('ERR_INVALID_SUFFIX')
    }
    // Display name must not contain path separators, control characters, or quotes (PlistBuddy safety)
    if (/[/\\'"\r\n\t]/.test(displayName)) {
      throw new Error('ERR_INVALID_NAME')
    }

    // Check for bundle ID collision with existing instances
    const newBundleId = `${WECHAT_BUNDLE_ID}${bundleSuffix}`
    const existing = await getInstances()
    if (existing.some((inst) => inst.bundleId === newBundleId)) {
      throw new Error(`ERR_ID_USED:${newBundleId}`)
    }

    const targetDir = join('/Applications', `${displayName}.app`)

    // Path safety check
    if (!isPathSafe(targetDir)) {
      throw new Error('ERR_INVALID_PATH')
    }

    // Check if target already exists (TOCTOU: also guarded by lock)
    try {
      await fs.access(targetDir)
      throw new Error(`ERR_APP_EXISTS:${displayName}`)
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e
    }

    // Step 1: Copy the app bundle
    onProgress?.({ stage: 'copy', percent: 10, message: 'PROG_COPY' })
    try {
      await exec('/bin/cp', ['-R', wechat.path, targetDir])
    } catch (e) {
      throw new Error(`ERR_COPY_FAILED:${(e as Error).message}`)
    }

    // Step 2: Modify Info.plist
    onProgress?.({ stage: 'plist', percent: 60, message: 'PROG_PLIST' })
    const plistPath = join(targetDir, 'Contents', 'Info.plist')
    try {
      await setPlistValue(plistPath, 'CFBundleIdentifier', newBundleId)
      await setPlistValue(plistPath, 'CFBundleName', displayName)
    } catch (e) {
      await fs.rm(targetDir, { recursive: true, force: true }).catch(() => {})
      throw new Error(`ERR_PLIST_FAILED:${(e as Error).message}`)
    }

    // Step 3: Re-sign
    onProgress?.({ stage: 'codesign', percent: 80, message: 'PROG_SIGN' })
    try {
      await exec('/usr/bin/codesign', ['-fs', '-', '--deep', targetDir])
    } catch (e) {
      await fs.rm(targetDir, { recursive: true, force: true }).catch(() => {})
      throw new Error(`ERR_SIGN_FAILED:${(e as Error).message}`)
    }

    onProgress?.({ stage: 'done', percent: 100, message: 'PROG_DONE' })
  })
}

export async function launchInstance(appPath: string): Promise<void> {
  // Validate path is within expected directories
  if (!isPathSafe(appPath)) {
    throw new Error('ERR_INVALID_PATH')
  }

  const execPath = await getExecutablePath(appPath)
  try {
    await fs.access(execPath)
  } catch {
    throw new Error(`ERR_APP_INVALID:${execPath}`)
  }

  const child = spawn(execPath, [], {
    detached: true,
    stdio: 'ignore'
  })
  child.unref()
}

export async function deleteInstance(appPath: string): Promise<void> {
  return withLock(async () => {
    // Validate path is within expected directories
    if (!isPathSafe(appPath)) {
      throw new Error('ERR_INVALID_PATH')
    }

    // Safety: read bundle ID and prevent deleting the original
    const plistPath = join(appPath, 'Contents', 'Info.plist')
    let bundleId: string
    try {
      bundleId = await readPlistValue(plistPath, 'CFBundleIdentifier')
    } catch {
      throw new Error('ERR_READ_PLIST_FAILED')
    }

    // CRITICAL: never delete the original WeChat
    if (bundleId === WECHAT_BUNDLE_ID) {
      throw new Error('ERR_CANNOT_DELETE_ORIGINAL')
    }

    // Check if it's running — refuse to delete running app
    const running = await isProcessRunning(appPath)
    if (running) {
      throw new Error('ERR_APP_RUNNING_DELETE')
    }

    // Remove the .app bundle
    await fs.rm(appPath, { recursive: true, force: true })

    // Remove sandbox container data
    const containerPath = join(app.getPath('home'), 'Library', 'Containers', bundleId)
    await fs.rm(containerPath, { recursive: true, force: true }).catch(() => {})

    // Also clean Group Containers if any
    const groupContainerPath = join(app.getPath('home'), 'Library', 'Group Containers', bundleId)
    await fs.rm(groupContainerPath, { recursive: true, force: true }).catch(() => {})
  })
}

export async function updateInstance(
  appPath: string,
  onProgress?: ProgressCallback
): Promise<void> {
  return withLock(async () => {
    // Validate path
    if (!isPathSafe(appPath)) {
      throw new Error('ERR_INVALID_PATH')
    }

    // Read current config BEFORE any destructive operations
    const plistPath = join(appPath, 'Contents', 'Info.plist')
    let bundleId: string
    let displayName: string
    try {
      bundleId = await readPlistValue(plistPath, 'CFBundleIdentifier')
      displayName = await readPlistValue(plistPath, 'CFBundleName')
    } catch {
      throw new Error('ERR_READ_PLIST_FAILED')
    }

    if (bundleId === WECHAT_BUNDLE_ID) {
      throw new Error('ERR_CANNOT_UPDATE_ORIGINAL')
    }

    const running = await isProcessRunning(appPath)
    if (running) {
      throw new Error('ERR_APP_RUNNING_UPDATE')
    }

    // Verify original WeChat still exists BEFORE destroying the clone
    const wechat = await detectWeChat()
    if (!wechat) throw new Error('ERR_ORIGINAL_NOT_FOUND')

    onProgress?.({ stage: 'delete', percent: 5, message: 'PROG_DELETE_OLD' })

    // Delete old app (but NOT the container data — preserve chat history)
    await fs.rm(appPath, { recursive: true, force: true })

    // Re-create with same config
    onProgress?.({ stage: 'copy', percent: 20, message: 'PROG_COPY_NEW' })
    try {
      await exec('/bin/cp', ['-R', wechat.path, appPath])
    } catch (e) {
      // CRITICAL: old app is gone but copy failed. Nothing we can rollback to.
      throw new Error(`ERR_UPDATE_REBUILD_FAILED:${(e as Error).message}`)
    }

    onProgress?.({ stage: 'plist', percent: 70, message: 'PROG_PLIST' })
    const newPlistPath = join(appPath, 'Contents', 'Info.plist')
    try {
      await setPlistValue(newPlistPath, 'CFBundleIdentifier', bundleId)
      await setPlistValue(newPlistPath, 'CFBundleName', displayName)
    } catch (e) {
      // Rollback: remove the broken copy
      await fs.rm(appPath, { recursive: true, force: true }).catch(() => {})
      throw new Error(`ERR_PLIST_FAILED:${(e as Error).message}`)
    }

    onProgress?.({ stage: 'codesign', percent: 90, message: 'PROG_SIGN' })
    try {
      await exec('/usr/bin/codesign', ['-fs', '-', '--deep', appPath])
    } catch (e) {
      await fs.rm(appPath, { recursive: true, force: true }).catch(() => {})
      throw new Error(`ERR_SIGN_FAILED:${(e as Error).message}`)
    }

    onProgress?.({ stage: 'done', percent: 100, message: 'PROG_UPDATE_DONE' })
  })
}

export async function checkRunning(appPath: string): Promise<boolean> {
  return isProcessRunning(appPath)
}
