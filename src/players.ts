import { CHARACTERS, type Character } from './characters'
import type { Level } from './levels'

const KEY = 'player'

export function characterById(id: string): Character {
    return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0]
}

// The first time someone opens the game they get a random character.
// It is remembered on this device, so they keep the same face and name.
export function loadPlayerId(): string {
    try {
        const saved = localStorage.getItem(KEY)
        if (saved && CHARACTERS.some((c) => c.id === saved)) return saved
    } catch {
        // storage unavailable: just pick one
    }
    const id = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)].id
    try {
        localStorage.setItem(KEY, id)
    } catch {
        // ignore
    }
    return id
}

// Each computer level has its own character.
const LEVEL_CHARACTER: Record<string, string> = {
    beginner: 'haru',
    casual: 'yuna',
    intermediate: 'ren',
    advanced: 'kaito',
    master: 'hikari',
    maximum: 'akira',
}

// The other side's character: the level's character against the computer,
// or a random different one for a second player on the same device.
export function pickOpponent(mineId: string, level?: Level): Character {
    const wanted = level ? LEVEL_CHARACTER[level.id] : undefined
    if (wanted && wanted !== mineId) return characterById(wanted)
    const others = CHARACTERS.filter((c) => c.id !== mineId && c.id !== wanted)
    return others[Math.floor(Math.random() * others.length)]
}