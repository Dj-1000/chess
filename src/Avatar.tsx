import { avatarSvg, type Character } from './characters'

// Draws a character's face. The artwork is our own SVG, so it is safe to inject.
export default function Avatar({ character }: { character: Character }) {
    return (
        <span
            className="avatar"
            role="img"
            aria-label={character.name}
            dangerouslySetInnerHTML={{ __html: avatarSvg(character) }}
        />
    )
}