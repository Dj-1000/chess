import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
    title: string
    children: ReactNode
    linkHref?: string
    linkText?: string
    onClose: () => void
}

// A small themed card with some information and an optional "learn more" link.
export default function InfoDialog({ title, children, linkHref, linkText, onClose }: Props) {
    const closeRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        closeRef.current?.focus()
    }, [])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div
                className="dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="info-title"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="info-title">{title}</h2>
                <div className="info-body">{children}</div>
                {linkHref && (
                    <p>
                        <a href={linkHref} target="_blank" rel="noopener noreferrer">
                            {linkText ?? 'Learn more'}
                        </a>
                    </p>
                )}
                <div className="dialog-actions">
                    <button ref={closeRef} className="primary" onClick={onClose}>
                        Got it
                    </button>
                </div>
            </div>
        </div>
    )
}