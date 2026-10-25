import type { CSSProperties, ReactElement } from 'react'

const KINDS = [
  'wP', 'wN', 'wB', 'wR', 'wQ', 'wK',
  'bP', 'bN', 'bB', 'bR', 'bQ', 'bK',
] as const

type PieceProps = { svgStyle?: CSSProperties }

// Builds the piece renderers for one image set (a folder in public/pieces).
export function makePieces(set: string) {
  const pieces: Record<string, (props?: PieceProps) => ReactElement> = {}
  for (const kind of KINDS) {
    pieces[kind] = (props) => (
      <img
        src={`${import.meta.env.BASE_URL}pieces/${set}/${kind}.png`}
        alt=""
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.35))',
          ...props?.svgStyle,
        }}
      />
    )
  }
  return pieces
}