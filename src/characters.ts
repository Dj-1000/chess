export type Style = 'short' | 'long' | 'twin' | 'spiky' | 'bob' | 'ponytail'

export type Character = {
    id: string
    name: string
    bg: string // background circle
    skin: string
    hair: string
    eye: string
    outfit: string
    style: Style
    glasses?: boolean
    ribbon?: string // ribbon color for twin tails
}

// Original anime-style characters (not based on any existing show).
export const CHARACTERS: Character[] = [
    { id: 'sora', name: 'Sora', bg: '#cfe8ff', skin: '#ffe0c8', hair: '#3b6fd6', eye: '#26c6c0', outfit: '#2c3e73', style: 'short' },
    { id: 'hikari', name: 'Hikari', bg: '#ffe9b8', skin: '#ffe3cf', hair: '#f2c038', eye: '#e0703a', outfit: '#c9415a', style: 'long' },
    { id: 'kaito', name: 'Kaito', bg: '#d8d2f5', skin: '#f3c9a6', hair: '#222838', eye: '#d9483e', outfit: '#3a3f5c', style: 'spiky' },
    { id: 'mei', name: 'Mei', bg: '#ffdcec', skin: '#ffe0c8', hair: '#f585b0', eye: '#7a5cf0', outfit: '#8a4d9c', style: 'twin', ribbon: '#d93a5b' },
    { id: 'ren', name: 'Ren', bg: '#dcf2e2', skin: '#f0c9a6', hair: '#9aa0ad', eye: '#3fae68', outfit: '#2f4b3d', style: 'bob', glasses: true },
    { id: 'yuna', name: 'Yuna', bg: '#fde0cc', skin: '#e8b48c', hair: '#7a4627', eye: '#3a86dd', outfit: '#d0653a', style: 'ponytail' },
    { id: 'haru', name: 'Haru', bg: '#ffdcc4', skin: '#c98d68', hair: '#d9532a', eye: '#f0b400', outfit: '#35527a', style: 'short' },
    { id: 'akira', name: 'Akira', bg: '#e4dbfa', skin: '#ffe0c8', hair: '#7c40d8', eye: '#33bfe0', outfit: '#463a78', style: 'spiky' },
]

const shade = (hex: string, amount: number) => {
    const n = parseInt(hex.slice(1), 16)
    const ch = (v: number) => Math.max(0, Math.min(255, v + amount))
    const r = ch(n >> 16)
    const g = ch((n >> 8) & 255)
    const b = ch(n & 255)
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
}

function hairBack(c: Character) {
    const h = c.hair
    const d = shade(h, -35)
    switch (c.style) {
        case 'long':
            return `<path d="M17 48C17 20 34 11 50 11S83 20 83 48L86 92H14Z" fill="${h}"/><path d="M17 60L14 92H26L22 62Z" fill="${d}" opacity=".5"/>`
        case 'bob':
            return `<path d="M17 50C17 22 33 11 50 11S83 22 83 50L81 72C70 77 30 77 19 72Z" fill="${h}"/>`
        case 'twin':
            return `<ellipse cx="50" cy="42" rx="33" ry="31" fill="${h}"/><path d="M20 44C6 52 6 78 14 90C20 80 24 66 26 52Z" fill="${h}"/><path d="M80 44C94 52 94 78 86 90C80 80 76 66 74 52Z" fill="${h}"/>`
        case 'ponytail':
            return `<ellipse cx="50" cy="42" rx="33" ry="31" fill="${h}"/><path d="M74 28C98 26 100 60 88 82C86 66 80 54 72 46Z" fill="${h}"/><path d="M76 30C84 32 86 38 84 44" stroke="${d}" stroke-width="2" fill="none"/>`
        case 'spiky':
            return `<ellipse cx="50" cy="42" rx="32" ry="30" fill="${h}"/>`
        default:
            return `<ellipse cx="50" cy="42" rx="32" ry="31" fill="${h}"/>`
    }
}

function hairFront(c: Character) {
    const h = c.hair
    const d = shade(h, -35)
    const fringe = `<path d="M23 52C19 24 36 11 50 11S81 24 77 52C74 42 70 33 64 29L60 40L54 26L48 40L42 27L38 38L32 31C28 37 25 44 23 52Z" fill="${h}"/>`
    const shine = `<path d="M34 22C40 16 50 14 58 16" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round" fill="none"/>`
    const edge = `<path d="M30 33L32 31L38 38L42 27L48 40L54 26L60 40L64 29" stroke="${d}" stroke-width="1" fill="none" opacity=".5"/>`
    let extra = ''
    if (c.style === 'spiky') {
        extra = `<path d="M24 28L26 6L38 20L46 0L56 18L68 2L74 24L80 20L77 34Z" fill="${h}"/>`
    }
    if (c.style === 'twin' && c.ribbon) {
        extra = `<path d="M20 46L10 40L12 52Z M20 46L28 38L30 50Z" fill="${c.ribbon}"/><circle cx="20" cy="46" r="3" fill="${shade(c.ribbon, -30)}"/><path d="M80 46L90 40L88 52Z M80 46L72 38L70 50Z" fill="${c.ribbon}"/><circle cx="80" cy="46" r="3" fill="${shade(c.ribbon, -30)}"/>`
    }
    if (c.style === 'ponytail') {
        extra = `<circle cx="76" cy="31" r="3.5" fill="#e0405a"/>`
    }
    return extra + fringe + edge + shine
}

function eye(cx: number, c: Character) {
    return (
        `<ellipse cx="${cx}" cy="54" rx="6.4" ry="8" fill="#fff"/>` +
        `<ellipse cx="${cx}" cy="55" rx="5" ry="7" fill="${c.eye}"/>` +
        `<ellipse cx="${cx}" cy="56" rx="3" ry="4.6" fill="#1a1626"/>` +
        `<circle cx="${cx + 2}" cy="51.5" r="2.3" fill="#fff"/>` +
        `<circle cx="${cx - 2}" cy="58" r="1.1" fill="#fff"/>` +
        `<path d="M${cx - 8} 49.5Q${cx} 44 ${cx + 8} 49.5" stroke="#241c2e" stroke-width="2.4" stroke-linecap="round" fill="none"/>`
    )
}

export function avatarSvg(c: Character): string {
    const skinShade = shade(c.skin, -22)
    const glasses = c.glasses
        ? `<g fill="none" stroke="#3a3548" stroke-width="1.8"><circle cx="38" cy="54" r="10"/><circle cx="62" cy="54" r="10"/><path d="M48 54H52"/></g>`
        : ''
    return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true">` +
        `<defs><clipPath id="clip-${c.id}"><circle cx="50" cy="50" r="50"/></clipPath></defs>` +
        `<g clip-path="url(#clip-${c.id})">` +
        `<rect width="100" height="100" fill="${c.bg}"/>` +
        hairBack(c) +
        `<rect x="43" y="66" width="14" height="16" fill="${skinShade}"/>` +
        `<path d="M10 100C12 82 28 76 50 76S88 82 90 100Z" fill="${c.outfit}"/>` +
        `<path d="M42 77L50 88L58 77Z" fill="#fff" opacity=".85"/>` +
        `<path d="M26 48C26 30 36 22 50 22S74 30 74 48C74 64 64 78 50 78S26 64 26 48Z" fill="${c.skin}"/>` +
        `<ellipse cx="31" cy="64" rx="5" ry="3" fill="#ff7f9c" opacity=".35"/>` +
        `<ellipse cx="69" cy="64" rx="5" ry="3" fill="#ff7f9c" opacity=".35"/>` +
        eye(38, c) +
        eye(62, c) +
        glasses +
        `<path d="M33 43Q38 40 44 42M56 42Q62 40 67 43" stroke="${shade(c.hair, -40)}" stroke-width="2" stroke-linecap="round" fill="none"/>` +
        `<path d="M50 64L49 67" stroke="${skinShade}" stroke-width="1.5" stroke-linecap="round"/>` +
        `<path d="M45 70Q50 74 55 70" stroke="#b5504f" stroke-width="2" stroke-linecap="round" fill="none"/>` +
        hairFront(c) +
        `</g></svg>`
    )
}