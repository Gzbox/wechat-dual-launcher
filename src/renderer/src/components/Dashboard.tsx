import { useState, useCallback, useEffect } from 'react'
import { useWeChat } from '../hooks/useWeChat'
import { useI18n } from '../i18n'
import { WeChatIcon } from './WeChatIcon'
import { ConfirmDialog } from './ConfirmDialog'
import { InfoModal } from './InfoModal'

export function Dashboard(): React.JSX.Element {
  const { t, lang, setLang } = useI18n()
  const { instances, loading, error, progress, create, launch, remove, update, clearError } =
    useWeChat()

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createSuffix, setCreateSuffix] = useState('')
  const [creating, setCreating] = useState(false)
  const [confirm, setConfirm] = useState<{
    type: 'delete' | 'update'
    path: string
  } | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [appVersion, setAppVersion] = useState('')
  const [checking, setChecking] = useState(false)

  // Fetch app version on mount
  useEffect(() => {
    window.api
      .getVersion()
      .then(setAppVersion)
      .catch(() => {})
  }, [])

  // Clamp selectedIndex when instances shrink (e.g. after delete)
  useEffect(() => {
    if (instances.length > 0 && selectedIndex >= instances.length) {
      setSelectedIndex(instances.length - 1)
    }
  }, [instances.length, selectedIndex])

  const selected = instances[Math.min(selectedIndex, Math.max(0, instances.length - 1))] || null
  const isOperating = progress !== null

  const handleCreate = useCallback(async () => {
    const finalName = createName.trim() || t.create.defaultName
    const finalSuffix = createSuffix.trim() || t.create.defaultSuffix
    setCreating(true)
    try {
      await create(finalName, finalSuffix)
      setShowCreate(false)
      setCreateName('')
      setCreateSuffix('')
    } catch {
      // handled by hook
    } finally {
      setCreating(false)
    }
  }, [create, createName, createSuffix, t])

  const handleConfirmAction = useCallback(async () => {
    if (!confirm) return
    try {
      if (confirm.type === 'delete') {
        await remove(confirm.path)
        setSelectedIndex(0)
      } else {
        await update(confirm.path)
      }
    } catch {
      // error is already handled and displayed by the useWeChat hook
    }
    setConfirm(null)
  }, [confirm, remove, update])

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-content-bg)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: 'var(--color-green)',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 12px'
            }}
          />
          <span style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>{t.detect.detecting}</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* ═══════════ LEFT SIDEBAR ═══════════ */}
      <div
        style={{
          width: 290,
          minWidth: 290,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-sidebar-bg)',
          paddingTop: 0
        }}
      >
        {/* Top spacer for native Mac traffic lights and window drag */}
        <div className="drag-region" style={{ height: 48 }} />

        {/* Logo area */}
        <div className="no-drag" style={{ textAlign: 'center', paddingTop: 28, paddingBottom: 36 }}>
          <div style={{ display: 'inline-block' }}>
            <WeChatIcon
              size={64}
              frontColor="#FFFFFF"
              backColor="rgba(255, 255, 255, 0.75)"
              eyeColor="var(--color-sidebar-bg)"
            />
          </div>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--color-sidebar-text)',
              marginTop: 18,
              fontFamily: 'var(--font-display)',
              letterSpacing: '1px'
            }}
          >
            {t.app.title}
          </h1>
        </div>

        {/* Divider below title */}
        <div style={{ height: 1, margin: '0 24px', background: 'rgba(255,255,255,0.06)' }} />

        {/* Instance list */}
        <div
          className="no-drag"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}
        >
          {instances.map((inst, i) => {
            const isActive = selectedIndex === i
            return (
              <div
                key={inst.appPath}
                className="animate-right hover-row"
                onClick={() => {
                  setSelectedIndex(i)
                  setShowCreate(false)
                }}
                style={
                  {
                    '--anim-delay': `${i * 0.05}s`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 20px',
                    borderRadius: 14,
                    cursor: 'pointer',
                    background: isActive ? 'var(--color-sidebar-item-active)' : 'transparent',
                    border: '1px solid transparent'
                  } as React.CSSProperties
                }
              >
                {/* Radio indicator */}
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: isActive
                      ? `2px solid var(--color-green)`
                      : `2px solid rgba(255,255,255,0.2)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'border-color 0.2s'
                  }}
                >
                  {isActive && (
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: 'var(--color-green)'
                      }}
                    />
                  )}
                </div>
                {/* Name */}
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: '#fff',
                    opacity: isActive ? 1 : 0.8,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}
                >
                  {inst.name}
                </span>
                {/* Running dot */}
                {inst.isRunning && (
                  <div
                    className="glow-dot"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--color-green)',
                      boxShadow: '0 0 8px var(--color-green-glow)',
                      flexShrink: 0
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Create button */}
        <div className="no-drag" style={{ padding: '0 24px 16px' }}>
          <button
            className="hover-card"
            onClick={() => setShowCreate(!showCreate)}
            disabled={isOperating}
            style={{
              width: '100%',
              padding: '16px 0',
              borderRadius: 14,
              border: 'none',
              background: 'var(--color-green)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: isOperating ? 'not-allowed' : 'pointer',
              opacity: isOperating ? 0.5 : 1,
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s'
            }}
          >
            {showCreate ? t.actions.cancel : `+ ${t.actions.create}`}
          </button>
        </div>

        {/* Version footer */}
        <div
          className="no-drag"
          style={{
            padding: '12px 24px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: 'var(--color-sidebar-text-dim)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.3px'
            }}
          >
            v{appVersion}
          </span>
          <button
            onClick={async () => {
              if (checking) return
              setChecking(true)
              try {
                await window.updaterApi.check()
              } catch {
                // handled by UpdaterModal
              } finally {
                setTimeout(() => setChecking(false), 3000)
              }
            }}
            disabled={checking}
            style={{
              background: 'none',
              border: 'none',
              color: checking ? 'var(--color-sidebar-text-dim)' : 'var(--color-green)',
              fontSize: 11,
              cursor: checking ? 'default' : 'pointer',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              padding: '2px 0',
              opacity: checking ? 0.6 : 0.8,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!checking) e.currentTarget.style.opacity = '1'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = checking ? '0.6' : '0.8'
            }}
          >
            {checking ? t.updater.checking : t.updater.checkForUpdates}
          </button>
        </div>
      </div>

      {/* ═══════════ RIGHT CONTENT ═══════════ */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-content-bg)',
          overflow: 'hidden',
          minWidth: 0
        }}
      >
        {/* Top bar with EN button */}
        <div
          className="drag-region"
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 32px',
            flexShrink: 0
          }}
        >
          <button
            className="no-drag"
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-dim)',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)'
            }}
          >
            {lang === 'zh' ? 'EN' : '中文'}
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="animate-in"
            style={{
              margin: '0 40px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 12,
              background: 'var(--color-danger-dim)',
              border: '1px solid rgba(232,77,77,0.15)'
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-danger)' }}>
              ⚠ {error}
            </span>
            <button
              onClick={clearError}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-danger)',
                cursor: 'pointer',
                fontSize: 16,
                padding: 0
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Main content scroll area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 40px 40px' }}>
          {showCreate ? (
            /* ──── Create form ──── */
            <div
              className="animate-in"
              style={{
                borderRadius: 20,
                padding: 40,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)'
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 24,
                  fontFamily: 'var(--font-display)'
                }}
              >
                {t.create.title}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--color-text-dim)',
                      marginBottom: 8
                    }}
                  >
                    {t.create.nameLabel}
                  </label>
                  <input
                    className="input"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder={t.create.namePlaceholder}
                    disabled={creating}
                    style={{ padding: '12px 16px', fontSize: 14 }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--color-text-dim)',
                      marginBottom: 8
                    }}
                  >
                    {t.create.suffixLabel}
                  </label>
                  <input
                    className="input"
                    value={createSuffix}
                    onChange={(e) => setCreateSuffix(e.target.value)}
                    placeholder={t.create.suffixPlaceholder}
                    disabled={creating}
                    style={{ padding: '12px 16px', fontSize: 14 }}
                  />
                </div>
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 12,
                    background: 'rgba(0,0,0,0.2)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--color-text-dim)'
                  }}
                >
                  Bundle ID →{' '}
                  <span style={{ color: 'var(--color-green)' }}>
                    com.tencent.xinWeChat{createSuffix.trim()}
                  </span>
                </div>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    borderRadius: 14,
                    border: 'none',
                    background: 'var(--color-green)',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: creating ? 'not-allowed' : 'pointer',
                    opacity: creating ? 0.5 : 1,
                    fontFamily: 'var(--font-body)',
                    marginTop: 8
                  }}
                >
                  {creating ? '⟳ ' + t.create.creating : '+ ' + t.actions.create}
                </button>
              </div>
            </div>
          ) : selected ? (
            /* ──── Detail panel ──── */
            <div className="animate-in" key={selected.appPath}>
              {/* Detail card */}
              <div
                className="glass-panel"
                style={{
                  borderRadius: 20,
                  padding: '36px 40px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)'
                }}
              >
                {/* Header: icon + name + status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 36 }}>
                  {/* Big green icon box */}
                  <div
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 22,
                      background: 'var(--color-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <WeChatIcon
                      size={52}
                      frontColor="#FFFFFF"
                      backColor="rgba(255, 255, 255, 0.3)"
                      eyeColor="var(--color-green)"
                    />
                  </div>

                  {/* Name + status vertically stacked aligned center with icon */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      justifyContent: 'center'
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: '#fff',
                        fontFamily: 'var(--font-display)',
                        lineHeight: 1
                      }}
                    >
                      {selected.name}
                    </h2>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 500,
                        color: selected.isRunning ? 'var(--color-green)' : 'var(--color-text-dim)'
                      }}
                    >
                      <div
                        className={selected.isRunning ? 'glow-dot' : ''}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: selected.isRunning
                            ? 'var(--color-green)'
                            : 'var(--color-text-dim)',
                          boxShadow: selected.isRunning ? '0 0 6px var(--color-green-glow)' : 'none'
                        }}
                      />
                      {selected.isRunning ? t.status.running : t.status.stopped}
                    </div>
                  </div>
                </div>

                {/* Divider exactly matching container width (using negative margins if padding is 40) */}
                <div
                  style={{ height: 1, background: 'var(--color-border)', margin: '0 -40px 32px' }}
                />

                {/* Info rows */}
                <div style={{ marginBottom: 32 }}>
                  {/* Bundle ID */}
                  <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
                    <span
                      style={{
                        width: 100,
                        fontSize: 14,
                        color: 'var(--color-text-secondary)',
                        fontWeight: 500,
                        flexShrink: 0
                      }}
                    >
                      Bundle ID
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-green)',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {selected.bundleId}
                    </span>
                  </div>
                  {/* Version */}
                  <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
                    <span
                      style={{
                        width: 100,
                        fontSize: 14,
                        color: 'var(--color-text-secondary)',
                        fontWeight: 500,
                        flexShrink: 0
                      }}
                    >
                      {t.detect.version}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-primary)',
                        flex: 1
                      }}
                    >
                      {selected.version}
                    </span>
                  </div>
                  {/* Path */}
                  <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
                    <span
                      style={{
                        width: 100,
                        fontSize: 14,
                        color: 'var(--color-text-secondary)',
                        fontWeight: 500,
                        flexShrink: 0
                      }}
                    >
                      {t.dashboard.path}
                    </span>
                    <span
                      title={selected.appPath}
                      style={{
                        fontSize: 13,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-text-primary)',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {selected.appPath}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{ height: 1, background: 'var(--color-border)', margin: '0 -40px 32px' }}
                />

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    className="btn btn-green"
                    onClick={() => !selected.isRunning && launch(selected.appPath)}
                    disabled={isOperating || selected.isRunning}
                    style={{
                      flex: 1,
                      padding: '16px 0',
                      borderRadius: 14,
                      fontSize: 15
                    }}
                  >
                    {t.actions.launch}
                  </button>

                  {!selected.isOriginal && (
                    <>
                      {/* Update button */}
                      <button
                        className="btn btn-outline"
                        onClick={() => setConfirm({ type: 'update', path: selected.appPath })}
                        disabled={isOperating || selected.isRunning}
                        style={{
                          flex: 1,
                          padding: '16px 0',
                          borderRadius: 14,
                          fontSize: 15
                        }}
                      >
                        {t.actions.update}
                      </button>

                      {/* Delete button */}
                      <button
                        className="btn btn-danger-outline"
                        onClick={() => setConfirm({ type: 'delete', path: selected.appPath })}
                        disabled={isOperating || selected.isRunning}
                        style={{
                          flex: 1,
                          padding: '16px 0',
                          borderRadius: 14,
                          fontSize: 15
                        }}
                      >
                        {t.actions.delete}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* FAQ Section */}
              <div style={{ marginTop: 32 }}>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#fff',
                    marginBottom: 16,
                    paddingLeft: 4
                  }}
                >
                  {t.dashboard.helpAndTips}
                </h3>
                <div className="responsive-grid">
                  {t.faq.items.map((item, i) => (
                    <div
                      key={i}
                      className="animate-in hover-card glass-panel"
                      style={
                        {
                          '--anim-delay': `${i * 0.08 + 0.15}s`,
                          borderRadius: 16,
                          padding: '24px',
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10
                        } as React.CSSProperties
                      }
                    >
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                          lineHeight: 1.5
                        }}
                      >
                        {item.q}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-dim)', lineHeight: 1.6 }}>
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <p style={{ fontSize: 14, color: 'var(--color-text-dim)' }}>{t.detect.notFound}</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.type === 'delete' ? t.confirm.deleteTitle : t.confirm.updateTitle}
        message={confirm?.type === 'delete' ? t.confirm.deleteMessage : t.confirm.updateMessage}
        danger={confirm?.type === 'delete'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirm(null)}
      />

      {/* Hidden tech-detail trigger */}
      <div
        onClick={() => setShowInfo(true)}
        title={t.dashboard.sysLogsAndTech}
        style={{
          position: 'fixed',
          bottom: 12,
          right: 12,
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: 'var(--color-text-dim)',
          opacity: 0.1,
          cursor: 'pointer',
          zIndex: 40,
          fontFamily: 'var(--font-mono)',
          transition: 'opacity 0.2s',
          fontWeight: 600,
          borderRadius: '50%'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.1')}
      >
        i
      </div>
      <InfoModal open={showInfo} onClose={() => setShowInfo(false)} />
    </div>
  )
}
