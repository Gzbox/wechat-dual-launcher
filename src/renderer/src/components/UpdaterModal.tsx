import React, { useEffect, useState } from 'react'
import { useI18n } from '../i18n'

export const UpdaterModal: React.FC = () => {
  const { t } = useI18n()
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState<
    'checking' | 'available' | 'downloading' | 'downloaded' | 'error' | 'idle'
  >('idle')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const unsubTrigger = window.updaterApi.triggerCheck(() => {
      window.updaterApi.check()
    })

    const unsubMsg = window.updaterApi.onMessage((msg) => {
      setMessage(msg)
    })

    const unsubAvail = window.updaterApi.onAvailable(() => {
      setStatus('available')
      setShow(true)
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

  const title =
    status === 'available'
      ? t.updater.newVersion
      : status === 'downloading'
        ? t.updater.downloading
        : status === 'downloaded'
          ? t.updater.downloaded
          : status === 'error'
            ? t.updater.updateError
            : ''

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'oklch(0.06 0.01 260 / 0.75)',
        backdropFilter: 'blur(6px)'
      }}
    >
      <div
        style={{
          width: 320,
          borderRadius: 16,
          padding: 24,
          background: 'oklch(0.20 0.014 260)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 64px oklch(0 0 0 / 0.6)',
          animation: 'slideUpScale 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center'
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 16,
            fontFamily: 'var(--font-display)',
            color: '#fff'
          }}
        >
          {title}
        </h2>

        {status === 'downloading' && (
          <div
            style={{
              width: '100%',
              height: 6,
              borderRadius: 3,
              background: 'rgba(255,255,255,0.1)',
              overflow: 'hidden',
              marginBottom: 12
            }}
          >
            <div
              className="progress-bar"
              style={{
                width: `${progress}%`,
                height: '100%',
                borderRadius: 3,
                background: 'var(--color-green)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        )}

        {(status === 'downloading' || status === 'available') && (
          <p
            style={{
              fontSize: 13,
              color: 'var(--color-text-dim)',
              marginBottom: 16
            }}
          >
            {t.updater.progress}: {progress}%
          </p>
        )}

        {status === 'error' && (
          <p
            style={{
              fontSize: 13,
              color: 'var(--color-danger)',
              marginBottom: 16,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              textAlign: 'center'
            }}
          >
            {message}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          {status === 'downloaded' ? (
            <button
              className="btn btn-green"
              onClick={() => window.updaterApi.quitAndInstall()}
              style={{
                padding: '10px 24px',
                borderRadius: 20,
                fontSize: 14
              }}
            >
              {t.updater.restartNow}
            </button>
          ) : (
            <>
              {status === 'error' && (
                <button
                  className="btn btn-outline"
                  onClick={() => setShow(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 20,
                    fontSize: 14
                  }}
                >
                  {t.updater.close}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
