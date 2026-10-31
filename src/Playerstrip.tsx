import Avatar from './Avatar'
import type { Character } from './characters'

type Props = {
    character: Character
    sub: string // small line under the name
    active: boolean // is it this player's turn?
    note?: string // e.g. "Thinking…"
}

// The bar above and below the board: face, name, and whose turn it is.
// The captured pieces will go under the name later.
export default function PlayerStrip({ character, sub, active, note }: Props) {
    return (
        <div className={`strip ${active ? 'active' : ''}`}>
            <Avatar character={character} />
            <div className="who">
                <strong>{character.name}</strong>
                <span>{sub}</span>
            </div>
            {note ? (
                <span className="strip-note">{note}</span>
            ) : active ? (
                <span className="turn-dot" aria-label="To move" />
            ) : null}
        </div>
    )
}