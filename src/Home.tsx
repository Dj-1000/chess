import type { ReactNode } from 'react'

type Mode = 'pass' | 'computer'

const MODES: {
  id: 'computer' | 'friend' | 'pass'
  title: string
  text: string
  cta: string
  ready: boolean
  icon: ReactNode
}[] = [
  {
    id: 'computer',
    title: 'Play the computer',
    text: 'Six levels, from beginner to a full-strength engine.',
    cta: 'Choose level',
    ready: true,
    icon: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </>
    ),
  },
  {
    id: 'friend',
    title: 'Play a friend online',
    text: 'Create a game and send the link. No account needed.',
    cta: 'Coming soon',
    ready: false,
    icon: (
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    ),
  },
  {
    id: 'pass',
    title: 'Pass and play',
    text: 'Two players, one device. Works offline.',
    cta: 'Start game',
    ready: true,
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M17 14c2.5 0 4 2 4 5" />
      </>
    ),
  },
]

export default function Home({ onPlay }: { onPlay: (mode: Mode) => void }) {
  return (
    <section className="home">
      <h1>Play chess your way.</h1>
      <p className="lead">
        Against the computer, a friend online, or side by side on one screen.
      </p>

      <div className="cards">
        {MODES.map((m) => (
          <div className="card" key={m.id}>
            <span className="icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {m.icon}
              </svg>
            </span>
            <h2>{m.title}</h2>
            <p>{m.text}</p>
            <button
              className="cta primary"
              disabled={!m.ready}
              onClick={() => m.id !== 'friend' && onPlay(m.id)}
            >
              {m.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="note">No sign-up. Your games are saved on this device.</p>
    </section>
  )
}