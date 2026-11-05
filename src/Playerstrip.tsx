import Avatar from './Avatar'
import type { Character } from './characters'

const ORDER = ['q', 'r', 'b', 'n', 'p'] // most valuable first
const NAMES: Record<string, string> = {
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
  p: 'pawn',
}

type Props = {
  character: Character
  sub: string // small text next to the name
  active: boolean // is it this player's turn?
  note?: string // e.g. "Thinking…"
  captured: string[] // pieces this player has captured: 'p', 'n', 'b', 'r' or 'q'
  capturedColor: 'w' | 'b' // the color of those captured pieces
  pieceSet: string // folder of piece images in public/pieces
  lead: number // how many points ahead this player is (0 if not ahead)
}

// The bar above and below the board: face, name, captured pieces, and whose turn it is.
export default function PlayerStrip({
  character,
  sub,
  active,
  note,
  captured,
  capturedColor,
  pieceSet,
  lead,
}: Props) {
  const groups = ORDER.map((type) => ({
    type,
    count: captured.filter((c) => c === type).length,
  })).filter((g) => g.count > 0)

  const summary = groups
    .map((g) => `${g.count} ${NAMES[g.type]}${g.count > 1 ? 's' : ''}`)
    .join(', ')

  return (
    <div className={`strip ${active ? 'active' : ''}`}>
      <Avatar character={character} />
      <div className="who">
        <div className="who-top">
          <strong>{character.name}</strong>
          <span>{sub}</span>
        </div>
        <div
          className="captured"
          aria-label={summary ? `Captured: ${summary}` : 'No captures yet'}
        >
          {groups.length > 0 && (
            <span className="cap-pill">
              {groups.map((g) => (
                <span className="cap-group" key={g.type}>
                  {Array.from({ length: g.count }, (_, i) => (
                    <img
                      key={i}
                      src={`${import.meta.env.BASE_URL}pieces/${pieceSet}/${capturedColor}${g.type.toUpperCase()}.png`}
                      alt=""
                      draggable={false}
                    />
                  ))}
                </span>
              ))}
            </span>
          )}
          {lead > 0 && <span className="lead">+{lead}</span>}
        </div>
      </div>
      {note ? (
        <span className="strip-note">{note}</span>
      ) : active ? (
        <span className="turn-dot" aria-label="To move" />
      ) : null}
    </div>
  )
}