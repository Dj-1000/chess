export type ThemeId = 'classic' | 'walnut'

export type Theme = {
  name: string
  light: string // light square color
  dark: string // dark square color
  pieceSet: string // folder name inside public/pieces
}

// To add a theme later: add it here, add its colors in index.css,
// and drop its piece images in public/pieces/<folder>.
export const THEMES: Record<ThemeId, Theme> = {
  classic: { name: 'Classic', light: '#ebe3cf', dark: '#6f9a82', pieceSet: 'jupiter' },
  walnut: { name: 'Walnut', light: '#d9b98c', dark: '#9a6a47', pieceSet: 'juno' },
}