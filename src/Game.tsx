import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Chess, type Square } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { THEMES, type ThemeId } from './themes'
import { makePieces } from './pieces'
import { Engine } from './engine'
import type { Level } from './levels'
import ConfirmDialog from './ConfirmDialog'
import PlayerStrip from './PlayerStrip'
import { characterById, pickOpponent } from './players'
import GameOverDialog from './GameOverDialog'
import InfoDialog from './InfoDialog'
import { APP_NAME, DRAW_ACCEPT_CP, DRAW_MIN_PLIES, THINK_MS } from './config'

const tint = (c: string) => `linear-gradient(${c}, ${c})`
const LAYER = {
  last: tint('rgba(235, 205, 70, 0.55)'),
  selected: tint('rgba(255, 240, 130, 0.75)'),
  check:
    'radial-gradient(circle, rgba(225, 60, 60, 0.95) 0%, rgba(225, 60, 60, 0) 72%)',
  dot: 'radial-gradient(circle, rgba(20, 30, 25, 0.35) 22%, transparent 24%)',
  ring: 'radial-gradient(circle, transparent 62%, rgba(20, 30, 25, 0.35) 64%)',
}

type Outcome = {
  kind: 'checkmate' | 'resign' | 'draw'
  winner: 'w' | 'b' | null
  headline: string // e.g. "You win!"
  reason: string // e.g. "Checkmate"
  status: string // the line shown in the side panel
}

// A game that ended without the board deciding it
type Ended = { kind: 'resign'; loser: 'w' | 'b' } | { kind: 'agreed' }

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
  playerId: string
  themeId: ThemeId
  onThemeChange: (id: ThemeId) => void
  onExit: () => void
  onNewGame: () => void
}

export default function Game({
  mode,
  level,
  playerColor,
  playerId,
  themeId,
  onThemeChange,
  onExit,
  onNewGame,
}: Props) {
  const vsComputer = mode === 'computer'

  const [me, setMe] = useState<'w' | 'b'>(playerColor ?? 'w')
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

  // How the game ended, when the board didn't decide it (resigned or agreed draw)
  const [ended, setEnded] = useState<Ended | null>(null)
  const [showOver, setShowOver] = useState(false)
  const [dialog, setDialog] = useState<'resign' | 'draw' | null>(null)
  const [drawBusy, setDrawBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [epOpen, setEpOpen] = useState(false)
  const listRef = useRef<HTMLOListElement>(null)

  // Computer opponent
  const [engine, setEngine] = useState<Engine | null>(null)
  const [thinking, setThinking] = useState(false)
  const [engineError, setEngineError] = useState<string | null>(null)
  const [gameId, setGameId] = useState(0)

  // Faces and names: you, and the other side
  const mine = characterById(playerId)
  const [opponent] = useState(() => pickOpponent(playerId, level))

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
    if (!engine || ended || game.isGameOver() || game.turn() === me) return
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
  }, [fen, engine, gameId, me]) // eslint-disable-line react-hooks/exhaustive-deps

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
    if (ended || drawBusy) return false
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
    if (ended || drawBusy) return
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
    setEnded(null)
    setShowOver(false)
    setDialog(null)
    setNotice(null)
    setDrawBusy(false)
    setGameId((g) => g + 1)
  }

  // Same opponent again. Against the computer, the colors swap.
  function rematch() {
    if (vsComputer) setMe((c) => (c === 'w' ? 'b' : 'w'))
    newGame()
  }

  // Resigning ends the game at once
  function resign() {
    setEnded({ kind: 'resign', loser: vsComputer ? me : game.turn() })
    setDialog(null)
    setSelected(null)
    setPending(null)
  }

  async function offerDraw() {
    if (!vsComputer) {
      setDialog('draw') // the other player answers
      return
    }
    if (!engine || engineError) {
      setNotice('The computer cannot answer a draw offer right now.')
      return
    }
    if (moves.length < DRAW_MIN_PLIES) {
      setNotice('The computer thinks it is too early for a draw.')
      return
    }
    setDrawBusy(true)
    const fenAtOffer = game.fen()
    try {
      // The score is from your point of view (it is your turn)
      const yourScore = await engine.evaluate(fenAtOffer)
      if (game.fen() !== fenAtOffer) return // the position changed meanwhile
      if (-yourScore <= DRAW_ACCEPT_CP) {
        setEnded({ kind: 'agreed' })
      } else {
        setNotice('The computer declined your draw offer.')
      }
    } catch {
      setNotice('The computer could not answer the draw offer.')
    } finally {
      setDrawBusy(false)
    }
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
  const kings: Partial<Record<'w' | 'b', string>> = {}
  for (const row of game.board()) {
    for (const piece of row) {
      if (piece && piece.type === 'k') kings[piece.color] = piece.square
    }
  }

  const kingInCheck = kings[game.turn()]
  if (kingInCheck && game.inCheck()) {
    add(kingInCheck, mated ? tint('rgba(220, 50, 50, 0.8)') : LAYER.check)
  }

  if (mated) {
    const winnerKing = kings[game.turn() === 'w' ? 'b' : 'w']
    if (winnerKing) add(winnerKing, tint('rgba(120, 190, 70, 0.8)'))
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

  const entries = moves.map((m) => ({ san: m.san, ep: m.flags.includes('e') }))
  const lastEp = entries.length > 0 && entries[entries.length - 1].ep
  const rows: { number: number; white: (typeof entries)[number]; black?: (typeof entries)[number] }[] = []
  for (let i = 0; i < entries.length; i += 2) {
    rows.push({ number: i / 2 + 1, white: entries[i], black: entries[i + 1] })
  }

  const epButton = (
    <button
      className="info-btn"
      aria-label="What is en passant?"
      title="What is en passant?"
      onClick={() => setEpOpen(true)}
    >
      i
    </button>
  )

  // How did the game end (if it did)?
  const colorName = (c: 'w' | 'b') => (c === 'w' ? 'White' : 'Black')
  const winnerHeadline = (winner: 'w' | 'b') =>
    vsComputer
      ? winner === me
        ? 'You win!'
        : 'The computer wins'
      : `${colorName(winner)} wins`
  const drawOutcome = (reason: string): Outcome => ({
    kind: 'draw',
    winner: null,
    headline: 'Draw',
    reason,
    status: `${reason}. Draw`,
  })

  let outcome: Outcome | null = null
  if (game.isCheckmate()) {
    const winner = game.turn() === 'w' ? 'b' : 'w'
    const headline = winnerHeadline(winner)
    outcome = {
      kind: 'checkmate',
      winner,
      headline,
      reason: 'Checkmate',
      status: `Checkmate. ${headline}`,
    }
  } else if (ended?.kind === 'resign') {
    const winner = ended.loser === 'w' ? 'b' : 'w'
    const headline = winnerHeadline(winner)
    const reason = vsComputer
      ? ended.loser === me
        ? 'You resigned'
        : 'The computer resigned'
      : `${colorName(ended.loser)} resigned`
    outcome = { kind: 'resign', winner, headline, reason, status: `${reason}. ${headline}` }
  } else if (ended?.kind === 'agreed') {
    outcome = {
      kind: 'draw',
      winner: null,
      headline: 'Draw agreed',
      reason: 'Both players agreed to a draw',
      status: 'Draw agreed',
    }
  } else if (game.isStalemate()) {
    outcome = drawOutcome('Stalemate')
  } else if (game.isInsufficientMaterial()) {
    outcome = drawOutcome('Not enough pieces to checkmate')
  } else if (game.isThreefoldRepetition()) {
    outcome = drawOutcome('Threefold repetition')
  } else if (game.isDrawByFiftyMoves()) {
    outcome = drawOutcome('The 50-move rule')
  } else if (game.isDraw()) {
    outcome = drawOutcome('The game is drawn')
  }

  // The result pop-up appears after the checkmate badges have settled
  const outcomeKey = outcome ? `${outcome.status}|${moves.length}` : ''
  useEffect(() => {
    if (!outcome) {
      setShowOver(false)
      return
    }
    const t = window.setTimeout(
      () => setShowOver(true),
      outcome.kind === 'checkmate' ? 3000 : 700,
    )
    return () => window.clearTimeout(t)
  }, [outcomeKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Messages like "draw declined" disappear by themselves
  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(() => setNotice(null), 4500)
    return () => window.clearTimeout(t)
  }, [notice])

  // Keep the newest move in view
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [moves.length])

  let status: string
  if (engineError) {
    status = engineError
  } else if (outcome) {
    status = outcome.status
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

  const side = game.turn()
  const canUndo =
    !ended &&
    !drawBusy &&
    (vsComputer
      ? !thinking && moves.length > (me === 'w' ? 0 : 1)
      : moves.length > 0)
  const myTurn = !vsComputer || (game.turn() === me && !thinking)
  const canAct = !outcome && moves.length > 0 && myTurn && !drawBusy

  const bottomColor: 'w' | 'b' = orientation === 'white' ? 'w' : 'b'
  const topColor: 'w' | 'b' = bottomColor === 'w' ? 'b' : 'w'

  // Captured pieces, worked out from the move history (so Undo updates them)
  const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 }
  const capturedBy: Record<'w' | 'b', string[]> = { w: [], b: [] }
  for (const m of moves) {
    if (m.captured) capturedBy[m.color].push(m.captured)
  }
  const points = (c: 'w' | 'b') =>
    capturedBy[c].reduce((sum, type) => sum + VALUE[type], 0)

  function nameOf(color: 'w' | 'b') {
    const isMine = vsComputer ? color === me : color === 'w'
    if (isMine) return mine.name
    return vsComputer ? `${opponent.name} (${level?.name} computer)` : opponent.name
  }

  async function copyPgn(): Promise<boolean> {
    const result = outcome
      ? outcome.winner === 'w'
        ? '1-0'
        : outcome.winner === 'b'
          ? '0-1'
          : '1/2-1/2'
      : '*'
    game.setHeader('Event', 'Casual game')
    game.setHeader('Site', APP_NAME)
    game.setHeader('Date', new Date().toISOString().slice(0, 10).replace(/-/g, '.'))
    game.setHeader('White', nameOf('w'))
    game.setHeader('Black', nameOf('b'))
    game.setHeader('Result', result)
    const text = game.pgn()
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      try {
        const box = document.createElement('textarea')
        box.value = text
        document.body.appendChild(box)
        box.select()
        const ok = document.execCommand('copy')
        box.remove()
        return ok
      } catch {
        return false
      }
    }
  }

  function renderStrip(color: 'w' | 'b') {
    const isMine = vsComputer ? color === me : color === 'w'
    const colorName = color === 'w' ? 'White' : 'Black'
    let sub: string
    if (vsComputer) {
      sub = isMine ? `You · ${colorName}` : `${level?.name} computer · ${colorName}`
    } else {
      sub = isMine ? `Player 1 · ${colorName}` : `Player 2 · ${colorName}`
    }
    const other = color === 'w' ? 'b' : 'w'
    return (
      <PlayerStrip
        character={isMine ? mine : opponent}
        sub={sub}
        active={!outcome && game.turn() === color}
        note={vsComputer && !isMine && thinking ? 'Thinking…' : undefined}
        captured={capturedBy[color]}
        capturedColor={other}
        pieceSet={theme.pieceSet}
        lead={Math.max(0, points(color) - points(other))}
      />
    )
  }

  return (
    <div className="stage">
      <div className="board-col">
        {renderStrip(topColor)}
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
          {mated && kings.w && kings.b && (
            <div
              className="mate-layer"
              role="status"
              aria-label={`Checkmate. ${outcome?.headline ?? ''}`}
            >
              {(['w', 'b'] as const).map((color) => {
                const sq = kings[color] as string
                const won = color !== game.turn()
                const file = sq.charCodeAt(0) - 97
                const rank = Number(sq[1]) - 1
                const col = orientation === 'white' ? file : 7 - file
                const row = orientation === 'white' ? 7 - rank : rank
                return (
                  <div
                    key={color}
                    className={`sq-mark ${won ? 'win' : 'lose'}`}
                    style={{ left: `${col * 12.5}%`, top: `${row * 12.5}%` }}
                  >
                    <span className="pill">{won ? 'Winner' : 'Checkmate'}</span>
                    <span className="dot" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        {won ? (
                          <path d="M3 18h18v2H3zM3 7l4.5 4L12 4l4.5 7L21 7l-2 10H5z" />
                        ) : (
                          <path
                            d="M10 3v5H5v3h5v10h3V11h5V8h-5V3z"
                            transform="rotate(70 12 12)"
                          />
                        )}
                      </svg>
                    </span>
                  </div>
                )
              })}
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
        {renderStrip(bottomColor)}
      </div>

      <aside className="panel">
        <h2>{vsComputer ? `vs Computer · ${level?.name}` : 'Pass and play'}</h2>
        <ol className="moves" ref={listRef}>
          {rows.length === 0 && <li className="empty">No moves yet</li>}
          {rows.map((r) => (
            <li key={r.number}>
              <span className="num">{r.number}.</span>
              <span className="mv">
                {r.white.san}
                {r.white.ep && epButton}
              </span>
              <span className="mv">
                {r.black?.san}
                {r.black?.ep && epButton}
              </span>
            </li>
          ))}
        </ol>
        <p className="status">
          {status}
          {lastEp && epButton}
        </p>
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
        {outcome && !showOver && (
          <button className="primary" onClick={() => setShowOver(true)}>
            View result
          </button>
        )}

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
          <button onClick={offerDraw} disabled={!canAct}>
            {drawBusy ? 'Asking…' : 'Offer draw'}
          </button>
          <button onClick={() => setDialog('resign')} disabled={!canAct}>
            Resign
          </button>
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

      {dialog === 'resign' && (
        <ConfirmDialog
          title={vsComputer ? 'Resign this game?' : `${colorName(game.turn())} resigns?`}
          message={
            vsComputer
              ? 'You will lose the game.'
              : `${colorName(game.turn())} will lose the game.`
          }
          confirmLabel="Resign"
          cancelLabel="Keep playing"
          onConfirm={resign}
          onCancel={() => setDialog(null)}
        />
      )}

      {dialog === 'draw' && (
        <ConfirmDialog
          title="Draw offer"
          message={`${colorName(game.turn())} offers a draw. Does ${colorName(game.turn() === 'w' ? 'b' : 'w')} accept?`}
          confirmLabel="Accept draw"
          cancelLabel="Decline"
          onConfirm={() => {
            setDialog(null)
            setEnded({ kind: 'agreed' })
          }}
          onCancel={() => {
            setDialog(null)
            setNotice('The draw offer was declined.')
          }}
        />
      )}

      {epOpen && (
        <InfoDialog
          title="En passant"
          linkHref="https://en.wikipedia.org/wiki/En_passant"
          linkText="Learn more about en passant"
          onClose={() => setEpOpen(false)}
        >
          <p>
            En passant is French for “in passing”. If a pawn moves two squares forward from
            its starting square and lands right next to an enemy pawn, that pawn may capture
            it as if it had moved only one square.
          </p>
          <p>The chance lasts for one move only, so it must be used straight away.</p>
        </InfoDialog>
      )}

      {outcome && showOver && (
        <GameOverDialog
          kind={
            outcome.winner === null
              ? 'draw'
              : vsComputer && outcome.winner !== me
                ? 'loss'
                : 'win'
          }
          headline={outcome.headline}
          reason={outcome.reason}
          onRematch={rematch}
          onNewGame={onNewGame}
          onCopyPgn={copyPgn}
          onClose={() => setShowOver(false)}
        />
      )}
    </div>
  )
}