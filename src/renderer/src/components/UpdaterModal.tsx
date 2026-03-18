import React, { useEffect, useState } from 'react'

export const UpdaterModal: React.FC = () => {
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState<
    'checking' | 'available' | 'downloading' | 'downloaded' | 'error' | 'idle'
  >('idle')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const unsubTrigger = window.updaterApi.triggerCheck(() => {
      // Optional: Auto check triggered from main process
      window.updaterApi.check()
    })

    const unsubMsg = window.updaterApi.onMessage((msg) => {
      setMessage(msg)
    })

    const unsubAvail = window.updaterApi.onAvailable(() => {
      setStatus('available')
      setShow(true)
      // Auto download
      window.updaterApi.download()
    })

    const unsubNotAvail = window.updaterApi.onNotAvailable(() => {
      setStatus('idle')
    })

    const unsubErr = window.updaterApi.onError((err) => {
      setStatus('error')
      setMessage(err)
      setShow(true)
    })

    const unsubProgress = window.updaterApi.onDownloadProgress((prog: unknown) => {
      setStatus('downloading')
      setShow(true)
      const percent = (prog as { percent?: number }).percent || 0
      setProgress(Math.round(percent))
    })

    const unsubDownloaded = window.updaterApi.onDownloaded(() => {
      setStatus('downloaded')
      setShow(true)
    })

    return () => {
      unsubTrigger()
      unsubMsg()
      unsubAvail()
      unsubNotAvail()
      unsubErr()
      unsubProgress()
      unsubDownloaded()
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-xl w-80 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">
          {status === 'available' && '发现新版本 (New Version)'}
          {status === 'downloading' && '下载中... (Downloading...)'}
          {status === 'downloaded' && '下载完成 (Downloaded)'}
          {status === 'error' && '更新出错 (Update Error)'}
        </h2>

        {status === 'downloading' && (
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-4">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {(status === 'downloading' || status === 'available') && (
          <p className="text-sm text-slate-400 mb-4">进度: {progress}%</p>
        )}

        {status === 'error' && (
          <p className="text-sm text-red-400 mb-4 whitespace-pre-wrap break-words">{message}</p>
        )}

        <div className="flex gap-4">
          {status === 'downloaded' ? (
            <button
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full font-medium hover:opacity-90 transition-opacity"
              onClick={() => window.updaterApi.quitAndInstall()}
            >
              立刻重启更新
            </button>
          ) : (
            <>
              {status === 'error' && (
                <button
                  className="px-4 py-2 bg-slate-700 rounded-full hover:bg-slate-600"
                  onClick={() => setShow(false)}
                >
                  关闭
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
