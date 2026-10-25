import { useEffect, useMemo, useState } from 'react'
import { Chess, type Square } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { APP_NAME } from './config'
import { THEMES, type ThemeId } from './themes'
import { makePieces } from './pieces'

const tint = (c: string) => `linear-gradient(${c}, ${c})`
const LAYER = {
  last: tint('rgba(235, 205, 70, 0.55)'),
  selected: tint('rgba(255, 240, 130, 0.75)'),
  check:
    'radial-gradient(circle, rgba(225, 60, 60, 0.95) 0%, rgba(225, 60, 60, 0) 72%)',
  dot: 'radial-gradient(circle, rgba(20, 30, 25, 0.35) 22%, transparent 24%)',
  ring: 'radial-gradient(circle, transparent 62%, rgba(20, 30, 25, 0.35) 64%)',
}

const PROMOTION_CHOICES = [
  { id: 'Q', name: 'queen' },
  { id: 'R', name: 'rook' },
  { id: 'B', name: 'bishop' },
  { id: 'N', name: 'knight' },
]

function loadTheme(): ThemeId {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'classic' || saved === 'walnut') return saved
  } catch {
    // storage unavailable: use the default
  }
  return 'classic'
}

export default function App() {
  const [game] = useState(() => new Chess())
  const [fen, setFen] = useState(game.fen())
  const [selected, setSelected] = useState<string | null>(null)
  const [showLegal, setShowLegal] = useState(true)
  const [pending, setPending] = useState<{ from: string; to: string } | null>(
    null,
  )
  const [themeId, setThemeId] = useState<ThemeId>(loadTheme)

  const theme = THEMES[themeId]
  const pieces = useMemo(() => makePieces(theme.pieceSet), [theme.pieceSet])

  useEffect(() => {
    document.title = APP_NAME
  }, [])

  // Apply the theme to the whole page and remember it for next visit
  useEffect(() => {
    document.documentElement.dataset.theme = themeId
    try {
      localStorage.setItem('theme', themeId)
    } catch {
      // ignore
    }
  }, [themeId])

  function baseColor(sq: string) {
    const file = sq.charCodeAt(0) - 97
    const rank = Number(sq[1]) - 1
    return (file + rank) % 2 === 1 ? theme.light : theme.dark
  }

  function needsPromotion(from: string, to: string) {
    return game
      .moves({ square: from as Square, verbose: true })
      .some((m) => m.to === to && m.promotion)
  }

  function makeMove(from: string, to: string, promotion?: string) {
    if (!promotion && needsPromotion(from, to)) {
      setPending({ from, to })
      return false
    }
    try {
      game.move({ from, to, promotion })
      setFen(game.fen())
      setSelected(null)
      setPending(null)
      return true
    } catch {
      return false
    }
  }

  function onPieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string
    targetSquare: string | null
  }) {
    if (!targetSquare) return false
    return makeMove(sourceSquare, targetSquare)
  }

  function onSquareClick({ square }: { square: string }) {
    if (selected && legalTargets.some((m) => m.to === square)) {
      makeMove(selected, square)
      return
    }
    const piece = game.get(square as Square)
    if (piece && piece.color === game.turn() && square !== selected) {
      setSelected(square)
    } else {
      setSelected(null)
    }
  }

  function undo() {
    game.undo()
    setFen(game.fen())
    setSelected(null)
    setPending(null)
  }

  function newGame() {
    game.reset()
    setFen(game.fen())
    setSelected(null)
    setPending(null)
  }

  const legalTargets = selected
    ? game.moves({ square: selected as Square, verbose: true })
    : []

  const layers: Record<string, string[]> = {}
  const add = (sq: string, layer: string) => {
    layers[sq] = [...(layers[sq] ?? []), layer]
  }

  const moves = game.history({ verbose: true })
  const last = moves[moves.length - 1]

  if (game.inCheck()) {
    for (const row of game.board()) {
      for (const piece of row) {
        if (piece && piece.type === 'k' && piece.color === game.turn()) {
          add(piece.square, LAYER.check)
        }
      }
    }
  }
  if (showLegal) {
    for (const m of legalTargets) {
      add(m.to, game.get(m.to) ? LAYER.ring : LAYER.dot)
    }
  }
  if (selected) add(selected, LAYER.selected)
  if (last) {
    add(last.from, LAYER.last)
    add(last.to, LAYER.last)
  }

  const squareStyles: Record<string, React.CSSProperties> = {}
  for (const sq of Object.keys(layers)) {
    squareStyles[sq] = {
      backgroundColor: baseColor(sq),
      backgroundImage: layers[sq].join(', '),
    }
  }

  const san = moves.map((m) => m.san)
  const rows: { number: number; white: string; black?: string }[] = []
  for (let i = 0; i < san.length; i += 2) {
    rows.push({ number: i / 2 + 1, white: san[i], black: san[i + 1] })
  }

  let status = game.turn() === 'w' ? 'White to move' : 'Black to move'
  if (game.isCheckmate()) {
    status = `Checkmate. ${game.turn() === 'w' ? 'Black' : 'White'} wins`
  } else if (game.isDraw()) {
    status = 'Draw'
  } else if (game.inCheck()) {
    status += ' (check)'
  }

  const side = game.turn() // whose pieces to show in the promotion picker

  return (
    <main className="app">
      <header className="topbar">
        <img
          className="logo"
          src={`${import.meta.env.BASE_URL}favicon.svg`}
          alt=""
        />
        <span>{APP_NAME}</span>
      </header>

      <div className="stage">
        <div className="board">
          <Chessboard
            options={{
              position: fen,
              onPieceDrop,
              onSquareClick,
              squareStyles,
              pieces,
              lightSquareStyle: { backgroundColor: theme.light },
              darkSquareStyle: { backgroundColor: theme.dark },
            }}
          />

          {pending && (
            <div className="promo-overlay">
              <div className="promo-card" role="dialog" aria-label="Promote pawn">
                <p>Promote pawn to</p>
                <div className="promo-choices">
                  {PROMOTION_CHOICES.map((c) => (
                    <button
                      key={c.id}
                      className="promo-btn"
                      aria-label={`Promote to ${c.name}`}
                      onClick={() => makeMove(pending.from, pending.to, c.id.toLowerCase())}
                    >
                      <img
                        src={`${import.meta.env.BASE_URL}pieces/${theme.pieceSet}/${side}${c.id}.png`}
                        alt=""
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
                <button className="cancel" onClick={() => setPending(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="panel">
          <h2>Moves</h2>
          <ol className="moves">
            {rows.length === 0 && <li className="empty">No moves yet</li>}
            {rows.map((r) => (
              <li key={r.number}>
                <span className="num">{r.number}.</span>
                <span>{r.white}</span>
                <span>{r.black ?? ''}</span>
              </li>
            ))}
          </ol>
          <p className="status">{status}</p>

          <label className="toggle">
            <input
              type="checkbox"
              checked={showLegal}
              onChange={(e) => setShowLegal(e.target.checked)}
            />
            Show legal moves
          </label>

          <div className="theme-picker">
            <span className="label">Board theme</span>
            <div className="swatches">
              {(Object.keys(THEMES) as ThemeId[]).map((id) => (
                <button
                  key={id}
                  className={`swatch ${id === themeId ? 'on' : ''}`}
                  aria-pressed={id === themeId}
                  onClick={() => setThemeId(id)}
                >
                  <span className="chips">
                    <i style={{ background: THEMES[id].light }} />
                    <i style={{ background: THEMES[id].dark }} />
                  </span>
                  {THEMES[id].name}
                </button>
              ))}
            </div>
          </div>

          <div className="buttons">
            <button onClick={undo}>Undo</button>
            <button onClick={newGame}>New game</button>
          </div>
        </aside>
      </div>

      <footer className="credit">
        Pieces by Toan Hoang (MIT license)
      </footer>
    </main>
  )
}