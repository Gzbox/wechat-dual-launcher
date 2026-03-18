import { useState, useEffect, useCallback, useRef } from 'react'
import { useI18n } from '../i18n'

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

interface UseWeChatReturn {
  wechatInfo: WeChatInfo | null
  instances: WeChatInstance[]
  loading: boolean
  error: string | null
  progress: ProgressEvent | null
  refresh: () => Promise<void>
  create: (name: string, suffix: string) => Promise<void>
  launch: (appPath: string) => Promise<void>
  remove: (appPath: string) => Promise<void>
  update: (appPath: string) => Promise<void>
  clearError: () => void
  clearProgress: () => void
}

export function useWeChat(): UseWeChatReturn {
  const { t } = useI18n()
  const [wechatInfo, setWechatInfo] = useState<WeChatInfo | null>(null)
  const [instances, setInstances] = useState<WeChatInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<ProgressEvent | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)
  // Track whether an operation is in flight to pause polling
  const operatingRef = useRef(false)

  const handleError = useCallback(
    (e: unknown) => {
      if (!mountedRef.current) return
      const rawMsg = e instanceof Error ? e.message : String(e)
      const cleanMsg = rawMsg.split('Error: ').pop() || rawMsg

      // Parse ERR_CODE:args format
      const parts = cleanMsg.split(':')
      const code = parts[0]
      const arg = parts.slice(1).join(':')

      if (t.errors && code in t.errors) {
        setError(
          arg
            ? `${t.errors[code as keyof typeof t.errors]} ${arg}`
            : t.errors[code as keyof typeof t.errors]
        )
      } else {
        setError(cleanMsg)
      }
    },
    [t]
  )

  // Full refresh — only sets loading=true on initial load
  const refresh = useCallback(
    async (showLoading = false) => {
      try {
        if (showLoading) setLoading(true)
        const [info, list] = await Promise.all([
          window.api.detectWeChat(),
          window.api.getInstances()
        ])
        if (!mountedRef.current) return
        setWechatInfo(info)
        setInstances(list)
      } catch (e) {
        handleError(e)
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    },
    [handleError]
  )

  // Initial load + polling for running status
  useEffect(() => {
    mountedRef.current = true

    // Initial load with loading indicator
    refresh(true)

    // Poll every 4s — only updates running status, skips during operations
    pollRef.current = setInterval(async () => {
      if (operatingRef.current) return // skip polling during operations
      try {
        const list = await window.api.getInstances()
        if (mountedRef.current && !operatingRef.current) {
          setInstances(list)
        }
      } catch {
        // silent — polling failures are not critical
      }
    }, 4000)

    return () => {
      mountedRef.current = false
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [refresh])

  // Listen to progress events from main process
  useEffect(() => {
    const cleanup = window.api.onProgress((event) => {
      if (!mountedRef.current) return

      const translatedMessage =
        t.progress && event.message in t.progress
          ? t.progress[event.message as keyof typeof t.progress]
          : event.message

      setProgress({ ...event, message: translatedMessage })

      if (event.stage === 'done') {
        setTimeout(() => {
          if (mountedRef.current) setProgress(null)
        }, 2000)
      }
    })
    return cleanup
  }, [t])

  const create = useCallback(
    async (name: string, suffix: string) => {
      operatingRef.current = true
      try {
        setError(null)
        await window.api.createInstance(name, suffix)
        await refresh()
      } catch (e) {
        handleError(e)
        throw e
      } finally {
        operatingRef.current = false
      }
    },
    [refresh, handleError]
  )

  const launch = useCallback(
    async (appPath: string) => {
      try {
        setError(null)
        await window.api.launchInstance(appPath)
        // Wait for process to start, then refresh to pick up running status
        setTimeout(() => refresh(), 1500)
      } catch (e) {
        handleError(e)
      }
    },
    [refresh, handleError]
  )

  const remove = useCallback(
    async (appPath: string) => {
      operatingRef.current = true
      try {
        setError(null)
        await window.api.deleteInstance(appPath)
        await refresh()
      } catch (e) {
        handleError(e)
      } finally {
        operatingRef.current = false
      }
    },
    [refresh, handleError]
  )

  const update = useCallback(
    async (appPath: string) => {
      operatingRef.current = true
      try {
        setError(null)
        await window.api.updateInstance(appPath)
        await refresh()
      } catch (e) {
        handleError(e)
      } finally {
        operatingRef.current = false
      }
    },
    [refresh, handleError]
  )

  const clearError = useCallback(() => setError(null), [])
  const clearProgress = useCallback(() => setProgress(null), [])

  return {
    wechatInfo,
    instances,
    loading,
    error,
    progress,
    refresh,
    create,
    launch,
    remove,
    update,
    clearError,
    clearProgress
  }
}
