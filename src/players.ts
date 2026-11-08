import { CHARACTERS, type Character } from './characters'
import type { Level } from './levels'

const KEY = 'player'

export function characterById(id: string): Character {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0]
}

// The character this person chose earlier on this device, or null on a first visit.
export function getSavedPlayerId(): string | null {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved && CHARACTERS.some((c) => c.id === saved)) return saved
  } catch {
    // storage unavailable
  }
  return null
}

export function savePlayerId(id: string) {
  try {
    localStorage.setItem(KEY, id)
  } catch {
    // ignore: the choice just won't be remembered
  }
}

export function randomCharacterId(): string {
  return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)].id
}

// Each computer level has its own character.
const LEVEL_CHARACTER: Record<string, string> = {
  beginner: 'ryo',
  casual: 'mira',
  intermediate: 'dante',
  advanced: 'kael',
  master: 'zev',
  maximum: 'razen',
}

// The other side's character: the level's character against the computer,
// or a random different one for a second player on the same device.
export function pickOpponent(mineId: string, level?: Level): Character {
  const wanted = level ? LEVEL_CHARACTER[level.id] : undefined
  if (wanted && wanted !== mineId) return characterById(wanted)
  const others = CHARACTERS.filter((c) => c.id !== mineId && c.id !== wanted)
  return others[Math.floor(Math.random() * others.length)]
}