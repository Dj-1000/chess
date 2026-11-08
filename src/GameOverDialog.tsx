import { useEffect, useRef, useState } from 'react'

type Props = {
    kind: 'win' | 'loss' | 'draw'
    headline: string // e.g. "You win!"
    reason: string // e.g. "Checkmate"
    onRematch: () => void
    onNewGame: () => void
    onCopyPgn: () => Promise<boolean>
    onClose: () => void // look at the final board
}

// Shown when a game ends: the result, and what to do next.
export default function GameOverDialog({
    kind,
    headline,
    reason,
    onRematch,
    onNewGame,
    onCopyPgn,
    onClose,
}: Props) {
    const firstRef = useRef<HTMLButtonElement>(null)
    const [copy, setCopy] = useState<'idle' | 'ok' | 'fail'>('idle')

    useEffect(() => {
        firstRef.current?.focus()
    }, [])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    async function copyPgn() {
        const ok = await onCopyPgn()
        setCopy(ok ? 'ok' : 'fail')
        window.setTimeout(() => setCopy('idle'), 2500)
    }

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div
                className={`dialog over ${kind}`}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="over-title"
                onClick={(e) => e.stopPropagation()}
            >
                <span className="over-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                        {kind === 'win' && <path d="M3 18h18v2H3zM3 7l4.5 4L12 4l4.5 7L21 7l-2 10H5z" />}
                        {kind === 'loss' && (
                            <path d="M10 3v5H5v3h5v10h3V11h5V8h-5V3z" transform="rotate(70 12 12)" />
                        )}
                        {kind === 'draw' && <path d="M5 8h14v3H5zM5 13h14v3H5z" />}
                    </svg>
                </span>
                <h2 id="over-title">{headline}</h2>
                <p>{reason}</p>

                <div className="over-actions">
                    <button ref={firstRef} className="primary" onClick={onRematch}>
                        Rematch
                    </button>
                    <button onClick={onNewGame}>New game</button>
                    <button onClick={copyPgn}>
                        {copy === 'ok' ? 'Copied!' : copy === 'fail' ? 'Could not copy' : 'Copy PGN'}
                    </button>
                    <button className="link-btn" onClick={onClose}>
                        Back to board
                    </button>
                </div>
            </div>
        </div>
    )
}