import { useState } from 'react'
import { Chess, type Square } from 'chess.js'
import { Chessboard } from 'react-chessboard'

const LIGHT = '#ebe3cf'
const DARK = '#6f9a82'

// Each highlight is a colored layer drawn on top of the square's own color.
const tint = (c: string) => `linear-gradient(${c}, ${c})`
const LAYER = {
  last: tint('rgba(235, 205, 70, 0.55)'),
  selected: tint('rgba(255, 240, 130, 0.75)'),
  check:
    'radial-gradient(circle, rgba(225, 60, 60, 0.95) 0%, rgba(225, 60, 60, 0) 72%)',
  dot: 'radial-gradient(circle, rgba(20, 30, 25, 0.35) 22%, transparent 24%)',
  ring: 'radial-gradient(circle, transparent 62%, rgba(20, 30, 25, 0.35) 64%)',
}

// a1 is a dark square; this works out the base color of any square.
function baseColor(sq: string) {
  const file = sq.charCodeAt(0) - 97
  const rank = Number(sq[1]) - 1
  return (file + rank) % 2 === 1 ? LIGHT : DARK
}

export default function App() {
  const [game] = useState(() => new Chess())
  const [fen, setFen] = useState(game.fen())
  const [selected, setSelected] = useState<string | null>(null)
  const [showLegal, setShowLegal] = useState(true)

  function makeMove(from: string, to: string) {
    try {
      // For now every promotion becomes a queen. The picker comes next.
      game.move({ from, to, promotion: 'q' })
      setFen(game.fen())
      setSelected(null)
      return true
    } catch {
      return false // illegal move
    }
  }

  // Drag and drop
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

  // Click a piece, then click where it should go
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
  }

  function newGame() {
    game.reset()
    setFen(game.fen())
    setSelected(null)
  }

  // Where the selected piece can legally go
  const legalTargets = selected
    ? game.moves({ square: selected as Square, verbose: true })
    : []

  // Collect highlight layers per square (first in the list is drawn on top)
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

  // Move list: group moves in pairs (white, black)
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

  return (
    <main className="app">
      <h1>Knightly</h1>
      <div className="layout">
        <div className="board">
          <Chessboard
            options={{
              position: fen,
              onPieceDrop,
              onSquareClick,
              squareStyles,
              lightSquareStyle: { backgroundColor: LIGHT },
              darkSquareStyle: { backgroundColor: DARK },
            }}
          />
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
          <div className="buttons">
            <button onClick={undo}>Undo</button>
            <button onClick={newGame}>New game</button>
          </div>
        </aside>
      </div>
    </main>
  )
}