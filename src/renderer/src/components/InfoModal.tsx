import React, { useState } from 'react'
import { useI18n } from '../i18n'

interface InfoModalProps {
  open: boolean
  onClose: () => void
}

export function InfoModal({ open, onClose }: InfoModalProps): React.JSX.Element | null {
  const [mounted, setMounted] = useState(false)
  const { t } = useI18n()

  // Manage mount/unmount for exit animations
  if (open && !mounted) {
    setMounted(true)
  }

  if (!mounted) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        overflow: 'hidden',
        pointerEvents: open ? 'auto' : 'none'
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          opacity: open ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
        onClick={onClose}
      />

      {/* Slide-over Panel (Drawer) */}
      <div
        className="no-drag"
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          bottom: 12,
          width: 480,
          maxWidth: 'calc(100vw - 24px)',
          borderRadius: 20,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(28, 30, 35, 0.75)',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.3), inset 1px 1px 0 rgba(255, 255, 255, 0.05)',
          transform: open ? 'translateX(0)' : 'translateX(105%)',
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)'
        }}
        onTransitionEnd={() => {
          if (!open) setMounted(false)
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Background Glows */}
        <div
          style={{
            position: 'absolute',
            top: '0%',
            right: '0%',
            width: '60%',
            height: '40%',
            background: 'var(--color-green)',
            filter: 'blur(80px)',
            opacity: 0.1,
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '-10%',
            width: '50%',
            height: '50%',
            background: 'var(--color-green-bright)',
            filter: 'blur(100px)',
            opacity: 0.05,
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 28px 20px',
            position: 'relative',
            zIndex: 10,
            flexShrink: 0,
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px',
              margin: 0
            }}
          >
            {t.infoModal.title}
          </h3>
          <button
            onClick={onClose}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.6)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.05)',
              cursor: 'pointer',
              fontSize: 14,
              transition: 'background 0.2s',
              padding: 0
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Scroll Area */}
        <div
          className="custom-scrollbar"
          style={{
            overflowY: 'auto',
            flex: 1,
            padding: '24px 28px 40px',
            color: 'rgba(255, 255, 255, 0.75)',
            position: 'relative',
            zIndex: 10
          }}
        >
          {/* Terminal Block */}
          <div
            style={{
              background: 'rgba(10, 12, 16, 0.7)',
              padding: '16px 20px',
              borderRadius: 12,
              marginBottom: 32,
              fontFamily: 'var(--font-mono)',
              fontSize: 12.5,
              color: '#4ade80',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
              lineHeight: 1.6
            }}
          >
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#ff5f56',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#ffbd2e',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#27c93f',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
            </div>
            <span style={{ color: '#8b949e' }}>➜</span> <span style={{ color: '#58a6ff' }}>~</span>{' '}
            whoami
            <br />
            root
            <br />
            <span style={{ color: '#8b949e' }}>➜</span> <span style={{ color: '#58a6ff' }}>~</span>{' '}
            cat /var/log/wechat-dual-launcher.sys
            <br />
            <span
              style={{ color: '#d2a8ff' }}
              dangerouslySetInnerHTML={{ __html: t.infoModal.terminal.diagnosticActive }}
            />
          </div>

          {t.infoModal.sections.map((section, idx) => (
            <Section key={idx} title={section.title}>
              <span dangerouslySetInnerHTML={{ __html: section.content }} />
            </Section>
          ))}
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
        
        code {
          background: rgba(255,255,255,0.08);
          padding: 2px 5px;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 0.85em;
          color: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.04);
        }
      `
        }}
      />
    </div>
  )
}

function Section({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div style={{ marginBottom: 28 }}>
      <h4
        style={{
          color: '#ffffff',
          fontSize: 14.5,
          fontWeight: 600,
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          letterSpacing: '0.2px',
          fontFamily: 'var(--font-display)',
          margin: '0 0 10px 0'
        }}
      >
        <div
          style={{
            width: 3,
            height: 14,
            background: 'var(--color-green)',
            borderRadius: 2,
            boxShadow: '0 0 8px var(--color-green-glow)'
          }}
        />
        {title}
      </h4>
      <p
        style={{
          paddingLeft: 11,
          color: 'rgba(255,255,255,0.65)',
          letterSpacing: '0.2px',
          lineHeight: 1.7,
          fontSize: 13,
          margin: 0
        }}
      >
        {children}
      </p>
    </div>
  )
}
