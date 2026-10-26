import { useEffect, useRef } from 'react'

type Props = {
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Focus the safe option when the dialog opens
  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  // Escape closes the dialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="dialog-title">{title}</h2>
        <p>{message}</p>
        <div className="dialog-actions">
          <button ref={cancelRef} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}