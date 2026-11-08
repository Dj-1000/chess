export const APP_NAME = 'Chess'
// How long the computer "thinks" before it plays, in milliseconds.
// It waits a random time between min and max. Change these to speed it up or slow it down.
export const THINK_MS = { min: 900, max: 2200 }
// The computer refuses a draw offer before this many half-moves (plies) have been played.
export const DRAW_MIN_PLIES = 20
// It accepts a draw only if it is not better than this many centipawns (100 = one pawn).
export const DRAW_ACCEPT_CP = 30