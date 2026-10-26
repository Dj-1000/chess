export type Level = {
  id: string
  name: string
  hint: string
  elo?: number // limit the engine to this rating
  skill?: number // or use Stockfish's Skill Level (0 to 20)
  depth?: number // optional cap on how far ahead it looks
  movetime: number // thinking time in milliseconds
}

export const LEVELS: Level[] = [
  { id: 'beginner', name: 'Beginner', hint: 'Makes plenty of mistakes', skill: 0, depth: 1, movetime: 200 },
  { id: 'casual', name: 'Casual', hint: 'Easy to beat', skill: 5, depth: 4, movetime: 400 },
  { id: 'intermediate', name: 'Intermediate', hint: 'Rated about 1600', elo: 1600, movetime: 700 },
  { id: 'advanced', name: 'Advanced', hint: 'Rated about 2000', elo: 2000, movetime: 1000 },
  { id: 'master', name: 'Master', hint: 'Rated about 2600', elo: 2600, movetime: 1500 },
  { id: 'maximum', name: 'Maximum', hint: 'Full strength', skill: 20, movetime: 2000 },
]