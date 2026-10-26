import type { Level } from './levels'

// Talks to Stockfish (running in a Web Worker) using the UCI text protocol.
export class Engine {
  private worker: Worker
  private listeners = new Set<(line: string) => void>()
  private ready: Promise<void>
  private active: Promise<string> | null = null
  private level: Level
  onError?: (message: string) => void

  constructor(level: Level) {
    this.level = level
    this.worker = new Worker(
      `${import.meta.env.BASE_URL}engine/stockfish-19-lite-single.js`,
    )
    this.worker.onmessage = (e) => {
      const line = String(e.data)
      this.listeners.forEach((fn) => fn(line))
    }
    this.worker.onerror = () => this.onError?.('The chess engine could not be loaded.')
    this.ready = this.init()
  }

  private send(command: string) {
    this.worker.postMessage(command)
  }

  private waitFor(prefix: string): Promise<string> {
    return new Promise((resolve) => {
      const fn = (line: string) => {
        if (line.startsWith(prefix)) {
          this.listeners.delete(fn)
          resolve(line)
        }
      }
      this.listeners.add(fn)
    })
  }

  private async init() {
    this.send('uci')
    await this.waitFor('uciok')
    if (this.level.elo) {
      this.send('setoption name UCI_LimitStrength value true')
      this.send(`setoption name UCI_Elo value ${this.level.elo}`)
    } else {
      this.send('setoption name UCI_LimitStrength value false')
      this.send(`setoption name Skill Level value ${this.level.skill ?? 20}`)
    }
    this.send('isready')
    await this.waitFor('readyok')
  }

  // Ask for the best move in a position. Returns e.g. "e2e4" or "e7e8q".
  async bestMove(fen: string): Promise<string> {
    await this.ready
    if (this.active) {
      // Finish the previous search first so its answer can't be mixed up
      this.send('stop')
      await this.active
    }
    const search = this.waitFor('bestmove')
    this.active = search
    this.send(`position fen ${fen}`)
    this.send(
      this.level.depth
        ? `go depth ${this.level.depth}`
        : `go movetime ${this.level.movetime}`,
    )
    const line = await search
    if (this.active === search) this.active = null
    return line.split(' ')[1]
  }

  destroy() {
    this.listeners.clear()
    this.worker.terminate()
  }
}