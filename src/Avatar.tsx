import type { Character } from './characters'

// A character's round portrait.
export default function Avatar({ character }: { character: Character }) {
  return (
    <span className="avatar">
      <img
        src={`${import.meta.env.BASE_URL}avatars/${character.image}`}
        alt={character.name}
        draggable={false}
      />
    </span>
  )
}