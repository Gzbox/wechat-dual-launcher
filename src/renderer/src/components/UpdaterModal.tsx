import React, { useEffect, useState } from 'react'
import { useI18n } from '../i18n'

export const UpdaterModal: React.FC = () => {
  const { t } = useI18n()
  const [show, setShow] = useState(false)
  const [status, setStatus] = useState<
    'available' | 'error' | 'idle' | 'up-to-date'
  >('idle')
  const [message, setMessage] = useState('')
  const [newVersion, setNewVersion] = useState('')

  useEffect(() => {
    const unsubTrigger = window.updaterApi.triggerCheck(() => {
      window.updaterApi.check()
    })

    const unsubMsg = window.updaterApi.onMessage((msg) => {
      setMessage(msg)
    })

    const unsubAvail = window.updaterApi.onAvailable((info) => {
      const version = (info as { version?: string }).version || ''
      setNewVersion(version)
      setStatus('available')
      setShow(true)
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

    return () => {
      unsubTrigger()
      unsubMsg()
      unsubAvail()
      unsubNotAvail()
      unsubErr()
    }
  }, [])

  if (!show) return null

  const title =
    status === 'available'
      ? t.updater.newVersion
      : status === 'error'
        ? t.updater.updateError
        : status === 'up-to-date'
          ? t.updater.upToDate
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
            marginBottom: 8,
            fontFamily: 'var(--font-display)',
            color: '#fff'
          }}
        >
          {title}
        </h2>

        {status === 'available' && newVersion && (
          <p
            style={{
              fontSize: 14,
              color: 'var(--color-green)',
              marginBottom: 16,
              fontWeight: 600
            }}
          >
            v{newVersion}
          </p>
        )}

        {status === 'available' && (
          <p
            style={{
              fontSize: 13,
              color: 'var(--color-text-dim)',
              marginBottom: 16,
              textAlign: 'center',
              lineHeight: 1.5
            }}
          >
            {t.updater.browserHint}
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
          {status === 'available' && (
            <>
              <button
                className="btn btn-green"
                onClick={() => {
                  window.updaterApi.openReleasePage()
                  setShow(false)
                  setStatus('idle')
                }}
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
                onClick={() => {
                  setShow(false)
                  setStatus('idle')
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 20,
                  fontSize: 14
                }}
              >
                {t.updater.later}
              </button>
            </>
          )}

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
        </div>
      </div>
    </div>
  )
}
