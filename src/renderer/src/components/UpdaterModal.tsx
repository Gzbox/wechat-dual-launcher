import React, { useEffect, useState } from 'react'
import { useI18n } from '../i18n'

export const UpdaterModal: React.FC = () => {
  const { t } = useI18n()
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState<
    'checking' | 'available' | 'downloading' | 'downloaded' | 'error' | 'idle' | 'up-to-date'
  >('idle')
  const [message, setMessage] = useState('')
  const [releaseUrl, setReleaseUrl] = useState('')

  useEffect(() => {
    const unsubTrigger = window.updaterApi.triggerCheck(() => {
      window.updaterApi.check()
    })

    const unsubMsg = window.updaterApi.onMessage((msg) => {
      setMessage(msg)
    })

    const unsubAvail = window.updaterApi.onAvailable((info: unknown) => {
      const updateInfo = info as { version?: string; releaseUrl?: string }
      setStatus('available')
      setShow(true)
      if (updateInfo.releaseUrl) {
        setReleaseUrl(updateInfo.releaseUrl)
      }
      if (updateInfo.version) {
        setMessage(updateInfo.version)
      }
    })

    const unsubNotAvail = window.updaterApi.onNotAvailable(() => {
      setStatus('up-to-date')
      setShow(true)
      setTimeout(() => {
        setShow(false)
        setStatus('idle')
      }, 2500)
    })

    const unsubErr = window.updaterApi.onError((err) => {
      setStatus('error')
      setMessage(err)
      setShow(true)
    })

    const unsubProgress = window.updaterApi.onDownloadProgress(() => {
      // no-op: we redirect to browser for download
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
            : status === 'up-to-date'
              ? t.updater.upToDate
              : ''

  const handleDownload = (): void => {
    if (releaseUrl) {
      window.updaterApi.openReleaseUrl(releaseUrl)
    }
    setShow(false)
  }

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

        {status === 'available' && message && (
          <p
            style={{
              fontSize: 14,
              color: 'var(--color-green)',
              marginBottom: 16,
              fontWeight: 600
            }}
          >
            v{message}
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
          {status === 'available' ? (
            <>
              <button
                className="btn btn-green"
                onClick={handleDownload}
                style={{
                  padding: '10px 24px',
                  borderRadius: 20,
                  fontSize: 14
                }}
              >
                {t.updater.downloadNow}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setShow(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 20,
                  fontSize: 14
                }}
              >
                {t.updater.later}
              </button>
            </>
          ) : (
            <>
              {(status === 'error' || status === 'downloaded') && (
                <>
                  {releaseUrl && (
                    <button
                      className="btn btn-green"
                      onClick={handleDownload}
                      style={{
                        padding: '10px 24px',
                        borderRadius: 20,
                        fontSize: 14
                      }}
                    >
                      {t.updater.downloadNow}
                    </button>
                  )}
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
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
