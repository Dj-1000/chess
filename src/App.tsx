import { useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'

const LAST_MOVE = { background: 'rgba(235, 205, 70, 0.55)' }
const CHECK = {
  background:
    'radial-gradient(circle, rgba(225, 60, 60, 0.95) 0%, rgba(225, 60, 60, 0) 72%)',
}

export default function App() {
  const [game] = useState(() => new Chess())
  const [fen, setFen] = useState(game.fen())

  function onPieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string
    targetSquare: string | null
  }) {
    if (!targetSquare) return false
    try {
      game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
      setFen(game.fen())
      return true
    } catch {
      return false
    }
  }

  function undo() {
    game.undo()
    setFen(game.fen())
  }

  function newGame() {
    game.reset()
    setFen(game.fen())
  }

  // Highlights: the last move, plus a red glow under a king in check.
  const squareStyles: Record<string, React.CSSProperties> = {}
  const moves = game.history({ verbose: true })
  const last = moves[moves.length - 1]
  if (last) {
    squareStyles[last.from] = LAST_MOVE
    squareStyles[last.to] = LAST_MOVE
  }
  if (game.inCheck()) {
    for (const row of game.board()) {
      for (const piece of row) {
        if (piece && piece.type === 'k' && piece.color === game.turn()) {
          squareStyles[piece.square] = CHECK
        }
      }
    }
  }

  // Move list: group moves in pairs (white, black).
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
              squareStyles,
              lightSquareStyle: { backgroundColor: '#ebe3cf' },
              darkSquareStyle: { backgroundColor: '#6f9a82' },
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
          <div className="buttons">
            <button onClick={undo}>Undo</button>
            <button onClick={newGame}>New game</button>
          </div>
        </aside>
      </div>
    </main>
  )
}