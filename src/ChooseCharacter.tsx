import { useState } from 'react'
import Avatar from './Avatar'
import { CHARACTERS } from './characters'
import { randomCharacterId } from './players'

type Props = {
<<<<<<< HEAD
    current: string | null // the character chosen before, if any
    onConfirm: (id: string) => void
    onCancel?: () => void // only when there is something to go back to
}

export default function ChooseCharacter({ current, onConfirm, onCancel }: Props) {
    const [picked, setPicked] = useState<string | null>(current)

    return (
        <section className="setup">
            <div className="setup-card">
                <div className="setup-head">
                    {onCancel && <button onClick={onCancel}>← Back</button>}
                    <h1>{current ? 'Change your character' : 'Choose your character'}</h1>
                </div>
                <p className="choose-text">
                    This is your face and name in every game. You can change it later.
                </p>

                <div className="chars">
                    {CHARACTERS.map((c) => (
                        <button
                            key={c.id}
                            className={`char ${c.id === picked ? 'on' : ''}`}
                            aria-pressed={c.id === picked}
                            onClick={() => setPicked(c.id)}
                        >
                            <Avatar character={c} />
                            <span>{c.name}</span>
                        </button>
                    ))}
                </div>

                <div className="choose-actions">
                    <button onClick={() => setPicked(randomCharacterId())}>Surprise me</button>
                    <button
                        className="primary"
                        disabled={!picked}
                        onClick={() => picked && onConfirm(picked)}
                    >
                        {picked ? "Let's play" : 'Pick a character'}
                    </button>
                </div>
            </div>
        </section>
    )
=======
  current: string | null // the character chosen before, if any
  onConfirm: (id: string) => void
  onCancel?: () => void // only when there is something to go back to
}

export default function ChooseCharacter({ current, onConfirm, onCancel }: Props) {
  const [picked, setPicked] = useState<string | null>(current)

  return (
    <section className="setup">
      <div className="setup-card">
        <div className="setup-head">
          {onCancel && <button onClick={onCancel}>← Back</button>}
          <h1>{current ? 'Change your character' : 'Choose your character'}</h1>
        </div>
        <p className="choose-text">
          This is your face and name in every game. You can change it later.
        </p>

        <div className="chars">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              className={`char ${c.id === picked ? 'on' : ''}`}
              aria-pressed={c.id === picked}
              onClick={() => setPicked(c.id)}
            >
              <Avatar character={c} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        <div className="choose-actions">
          <button onClick={() => setPicked(randomCharacterId())}>Surprise me</button>
          <button
            className="primary"
            disabled={!picked}
            onClick={() => picked && onConfirm(picked)}
          >
            {picked ? "Let's play" : 'Pick a character'}
          </button>
        </div>
      </div>
    </section>
  )
>>>>>>> f29e1ff214adeb50c48f31ac2155c2202a0a7b1b
}