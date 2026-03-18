import { useI18n } from '../i18n'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  danger
}: ConfirmDialogProps): React.JSX.Element | null {
  const { t } = useI18n()

  if (!open) return null

  return (
    <div
      onClick={onCancel}
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
          margin: '0 24px',
          width: '100%',
          maxWidth: '340px',
          borderRadius: 16,
          padding: 20,
          background: 'oklch(0.20 0.014 260)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 64px oklch(0 0 0 / 0.6)',
          animation: 'slideUpScale 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            marginBottom: 8,
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            marginTop: 0
          }}
        >
          {title}
        </h3>
        <p
          style={{
            marginBottom: 20,
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--color-text-dim)',
            marginTop: 0
          }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn btn-outline" onClick={onCancel}>
            {t.actions.cancel}
          </button>
          <button
            className={`btn ${danger ? 'btn-danger-outline' : 'btn-green'}`}
            style={
              danger
                ? {
                    background: 'var(--color-danger)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 2px 8px oklch(0.65 0.22 25 / 0.3)'
                  }
                : {}
            }
            onClick={onConfirm}
          >
            {t.actions.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
