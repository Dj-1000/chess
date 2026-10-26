import { useState } from 'react'
import { LEVELS, type Level } from './levels'

type ColorChoice = 'w' | 'random' | 'b'

const COLORS: { id: ColorChoice; label: string }[] = [
  { id: 'w', label: 'White' },
  { id: 'random', label: 'Random' },
  { id: 'b', label: 'Black' },
]

type Props = {
  onStart: (level: Level, color: 'w' | 'b') => void
  onBack: () => void
}

export default function Setup({ onStart, onBack }: Props) {
  const [levelId, setLevelId] = useState('intermediate')
  const [color, setColor] = useState<ColorChoice>('w')

  function start() {
    const level = LEVELS.find((l) => l.id === levelId) ?? LEVELS[2]
    const side = color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : color
    onStart(level, side)
  }

  return (
    <section className="setup">
      <div className="setup-card">
        <div className="setup-head">
          <button onClick={onBack}>← Back</button>
          <h1>Play the computer</h1>
        </div>

        <span className="label">Difficulty</span>
        <div className="levels">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              className={`level ${l.id === levelId ? 'on' : ''}`}
              aria-pressed={l.id === levelId}
              onClick={() => setLevelId(l.id)}
            >
              {l.name}
              <small>{l.hint}</small>
            </button>
          ))}
        </div>

        <span className="label">Play as</span>
        <div className="colors">
          {COLORS.map((c) => (
            <button
              key={c.id}
              className={c.id === color ? 'on' : ''}
              aria-pressed={c.id === color}
              onClick={() => setColor(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button className="primary start" onClick={start}>
          Start game
        </button>
      </div>
    </section>
  )
}