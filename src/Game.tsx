import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Chess, type Square } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { THEMES, type ThemeId } from './themes'
import { makePieces } from './pieces'
import { Engine } from './engine'
import type { Level } from './levels'
import ConfirmDialog from './ConfirmDialog'
import { THINK_MS } from './config'

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

type Props = {
  mode: 'pass' | 'computer'
  level?: Level
  playerColor?: 'w' | 'b'
  themeId: ThemeId
  onThemeChange: (id: ThemeId) => void
  onExit: () => void
}

export default function Game({
  mode,
  level,
  playerColor,
  themeId,
  onThemeChange,
  onExit,
}: Props) {
  const vsComputer = mode === 'computer'
  const me = playerColor ?? 'w'

  const [game] = useState(() => new Chess())
  const [fen, setFen] = useState(game.fen())
  const [selected, setSelected] = useState<string | null>(null)
  const [showLegal, setShowLegal] = useState(true)
  const [pending, setPending] = useState<{ from: string; to: string } | null>(
    null,
  )
  const [flipped, setFlipped] = useState(false)
  const [autoFlip, setAutoFlip] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)

  // Computer opponent
  const [engine, setEngine] = useState<Engine | null>(null)
  const [thinking, setThinking] = useState(false)
  const [engineError, setEngineError] = useState<string | null>(null)
  const [gameId, setGameId] = useState(0)

  const theme = THEMES[themeId]
  const pieces = useMemo(() => makePieces(theme.pieceSet), [theme.pieceSet])

  // Start the engine when a computer game begins, stop it when leaving
  useEffect(() => {
    if (!vsComputer || !level) return
    const e = new Engine(level)
    e.onError = (message) => {
      setEngineError(message)
      setThinking(false)
    }
    setEngine(e)
    return () => {
      e.destroy()
      setEngine(null)
    }
  }, [vsComputer, level])

  // When it is the computer's turn, ask the engine for a move,
  // then wait a moment so it doesn't answer instantly
  useEffect(() => {
    if (!engine || game.isGameOver() || game.turn() === me) return
    let stale = false
    let timer: number | undefined
    const started = Date.now()
    const pause = THINK_MS.min + Math.random() * (THINK_MS.max - THINK_MS.min)
    setThinking(true)
    engine
      .bestMove(game.fen())
      .then((uci) => {
        if (stale) return
        const wait = Math.max(0, pause - (Date.now() - started))
        timer = window.setTimeout(() => {
          if (stale) return
          try {
            game.move({
              from: uci.slice(0, 2),
              to: uci.slice(2, 4),
              promotion: uci[4],
            })
            setFen(game.fen())
          } catch {
            setEngineError('The engine returned a move that could not be played.')
          }
          setThinking(false)
        }, wait)
      })
      .catch(() => {
        if (!stale) setThinking(false)
      })
    return () => {
      stale = true
      window.clearTimeout(timer)
    }
  }, [fen, engine, gameId]) // eslint-disable-line react-hooks/exhaustive-deps

  const orientation: 'white' | 'black' = vsComputer
    ? me === 'w'
      ? 'white'
      : 'black'
    : autoFlip
      ? game.turn() === 'w'
        ? 'white'
        : 'black'
      : flipped
        ? 'black'
        : 'white'

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
    if (vsComputer && game.turn() !== me) return false
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
    if (vsComputer && game.turn() !== me) return
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
    // Against the computer, also take back its reply
    if (vsComputer && game.turn() !== me) game.undo()
    setFen(game.fen())
    setSelected(null)
    setPending(null)
  }

  function newGame() {
    game.reset()
    setFen(game.fen())
    setSelected(null)
    setPending(null)
    setGameId((g) => g + 1)
  }

  function leave() {
    if (game.history().length > 0) setConfirmLeave(true)
    else onExit()
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

  const mated = game.isCheckmate()
  let matedSquare: string | null = null
  if (game.inCheck()) {
    for (const row of game.board()) {
      for (const piece of row) {
        if (piece && piece.type === 'k' && piece.color === game.turn()) {
          add(piece.square, LAYER.check)
          if (mated) matedSquare = piece.square
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

  const squareStyles: Record<string, CSSProperties> = {}
  for (const sq of Object.keys(layers)) {
    squareStyles[sq] = {
      backgroundColor: baseColor(sq),
      backgroundImage: layers[sq].join(', '),
    }
  }

  if (matedSquare) {
    squareStyles[matedSquare] = {
      ...squareStyles[matedSquare],
      animation: 'mate-pulse 1.1s ease-in-out infinite',
    }
  }

  const san = moves.map((m) => m.san)
  const rows: { number: number; white: string; black?: string }[] = []
  for (let i = 0; i < san.length; i += 2) {
    rows.push({ number: i / 2 + 1, white: san[i], black: san[i + 1] })
  }

  let status: string
  if (engineError) {
    status = engineError
  } else if (game.isCheckmate()) {
    const loser = game.turn()
    status = vsComputer
      ? loser === me
        ? 'Checkmate. The computer wins'
        : 'Checkmate. You win!'
      : `Checkmate. ${loser === 'w' ? 'Black' : 'White'} wins`
  } else if (game.isDraw()) {
    status = 'Draw'
  } else if (vsComputer) {
    status = thinking
      ? 'Computer is thinking…'
      : game.turn() === me
        ? 'Your move'
        : 'Computer to move'
    if (game.inCheck() && !thinking) status += ' (check)'
  } else {
    status = game.turn() === 'w' ? 'White to move' : 'Black to move'
    if (game.inCheck()) status += ' (check)'
  }

  const winnerText = vsComputer
    ? game.turn() === me
      ? 'The computer wins'
      : 'You win!'
    : `${game.turn() === 'w' ? 'Black' : 'White'} wins`

  const side = game.turn()
  const canUndo = vsComputer
    ? !thinking && moves.length > (me === 'w' ? 0 : 1)
    : moves.length > 0

  return (
    <div className="stage">
      <div className="board">
        <Chessboard
          options={{
            position: fen,
            boardOrientation: orientation,
            onPieceDrop,
            onSquareClick,
            squareStyles,
            pieces,
            lightSquareStyle: { backgroundColor: theme.light },
            darkSquareStyle: { backgroundColor: theme.dark },
          }}
        />
        {mated && (
          <div className="mate-banner" key={fen} role="status">
            <strong>Checkmate</strong>
            <span>{winnerText}</span>
          </div>
        )}
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
                    onClick={() =>
                      makeMove(pending.from, pending.to, c.id.toLowerCase())
                    }
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
        <h2>{vsComputer ? `vs Computer · ${level?.name}` : 'Pass and play'}</h2>
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

        {!vsComputer && (
          <label className="toggle">
            <input
              type="checkbox"
              checked={autoFlip}
              onChange={(e) => setAutoFlip(e.target.checked)}
            />
            Flip board after each move
          </label>
        )}

        <div className="theme-picker">
          <span className="label">Board theme</span>
          <div className="swatches">
            {(Object.keys(THEMES) as ThemeId[]).map((id) => (
              <button
                key={id}
                className={`swatch ${id === themeId ? 'on' : ''}`}
                aria-pressed={id === themeId}
                onClick={() => onThemeChange(id)}
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
          <button onClick={undo} disabled={!canUndo}>
            Undo
          </button>
          {!vsComputer && (
            <button onClick={() => setFlipped((f) => !f)} disabled={autoFlip}>
              Flip board
            </button>
          )}
          <button onClick={newGame}>New game</button>
          <button onClick={leave}>Menu</button>
        </div>
      </aside>

      {confirmLeave && (
        <ConfirmDialog
          title="Leave this game?"
          message="Your progress in this game will be lost."
          confirmLabel="Leave game"
          cancelLabel="Keep playing"
          onConfirm={onExit}
          onCancel={() => setConfirmLeave(false)}
        />
      )}
    </div>
  )
}