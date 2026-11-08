export type Style = 'short' | 'long' | 'twin' | 'spiky' | 'bob' | 'ponytail'
export type Gender = 'male' | 'female'
export type CharacterId =
    | 'goku'
    | 'naruto'
    | 'luffy'
    | 'gojo'
    | 'levi'
    | 'nezuko'
    | 'mikasa'
    | 'yor'

export type Character = {
    id: CharacterId
    name: string
    anime: string
    gender: Gender
    bg: string
    skin: string
    hair: string
    hairAccent?: string
    eye: string
    outfit: string
    style: Style
    accessory?: 'none' | 'naruto-headband' | 'straw-hat' | 'gojo-blindfold' | 'nezuko-bamboo' | 'mikasa-scarf' | 'yor-ornaments'
    marks?: 'naruto-whiskers'
}

// Stylized, original SVG fan-art interpretations for a personal portfolio project.
// These are not official anime assets. Character names and visual identifiers belong
// to their respective rights holders. Check permissions before public/commercial release.
export const CHARACTERS: Character[] = [
    {
        id: 'goku', name: 'Goku', anime: 'Dragon Ball', gender: 'male',
        bg: '#d8eaff', skin: '#f4c9a8', hair: '#171923', eye: '#222b45',
        outfit: '#ed7135', style: 'spiky',
    },
    {
        id: 'naruto', name: 'Naruto', anime: 'Naruto', gender: 'male',
        bg: '#ffe5bd', skin: '#f6cfad', hair: '#f3a51c', eye: '#4b8bcb',
        outfit: '#e87527', style: 'spiky', accessory: 'naruto-headband',
        marks: 'naruto-whiskers',
    },
    {
        id: 'luffy', name: 'Luffy', anime: 'One Piece', gender: 'male',
        bg: '#ffe2d5', skin: '#f4c9a8', hair: '#211b1b', eye: '#3b2925',
        outfit: '#d94c42', style: 'short', accessory: 'straw-hat',
    },
    {
        id: 'gojo', name: 'Gojo', anime: 'Jujutsu Kaisen', gender: 'male',
        bg: '#e7e4ff', skin: '#f4d2bd', hair: '#e8edf5', eye: '#5a9ee8',
        outfit: '#26334c', style: 'spiky', accessory: 'gojo-blindfold',
    },
    {
        id: 'levi', name: 'Levi', anime: 'Attack on Titan', gender: 'male',
        bg: '#dcebe3', skin: '#efd0b7', hair: '#34313a', eye: '#7b8b91',
        outfit: '#405b50', style: 'bob',
    },
    {
        id: 'nezuko', name: 'Nezuko', anime: 'Demon Slayer', gender: 'female',
        bg: '#f8dce8', skin: '#f5d2b8', hair: '#30202a', hairAccent: '#d982a0',
        eye: '#b84b72', outfit: '#b85d82', style: 'long', accessory: 'nezuko-bamboo',
    },
    {
        id: 'mikasa', name: 'Mikasa', anime: 'Attack on Titan', gender: 'female',
        bg: '#eadfd8', skin: '#edc6aa', hair: '#302a2b', eye: '#6c5149',
        outfit: '#7d5146', style: 'bob', accessory: 'mikasa-scarf',
    },
    {
        id: 'yor', name: 'Yor', anime: 'Spy x Family', gender: 'female',
        bg: '#f7e4dc', skin: '#f4cdb5', hair: '#241c25', eye: '#a33d48',
        outfit: '#782f3d', style: 'long', accessory: 'yor-ornaments',
    },
]

const shade = (hex: string, amount: number) => {
    const n = Number.parseInt(hex.slice(1), 16)
    const ch = (v: number) => Math.max(0, Math.min(255, v + amount))
    const r = ch(n >> 16)
    const g = ch((n >> 8) & 255)
    const b = ch(n & 255)
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

function hairBack(c: Character) {
    const h = c.hair
    switch (c.style) {
        case 'long':
            return `<path d="M16 51C14 22 33 9 50 9S86 22 84 51L91 100H9Z" fill="${h}"/>`
        case 'bob':
            return `<path d="M16 50C16 22 33 10 50 10S84 22 84 50L82 78Q50 88 18 78Z" fill="${h}"/>`
        case 'twin':
            return `<ellipse cx="50" cy="42" rx="34" ry="32" fill="${h}"/><path d="M19 43C5 55 7 82 15 91C23 78 25 61 26 49ZM81 43C95 55 93 82 85 91C77 78 75 61 74 49Z" fill="${h}"/>`
        case 'ponytail':
            return `<ellipse cx="50" cy="42" rx="34" ry="32" fill="${h}"/><path d="M75 28C99 25 101 61 87 84C86 64 79 52 72 45Z" fill="${h}"/>`
        default:
            return `<ellipse cx="50" cy="42" rx="34" ry="32" fill="${h}"/>`
    }
}

function hairFront(c: Character) {
    const h = c.hair
    const d = shade(h, -35)

    if (c.id === 'goku') {
        return `<path d="M19 43L13 16L30 25L32 3L45 21L53 0L62 22L77 7L75 29L88 22L79 49L70 40L63 49L55 36L47 49L39 37L30 49Z" fill="${h}" stroke="${d}" stroke-width="1.2" stroke-linejoin="round"/>`
    }
    if (c.id === 'naruto') {
        return `<path d="M19 44L13 19L29 27L31 8L43 24L51 5L61 25L75 11L74 32L86 25L79 50L69 41L61 49L53 39L45 49L36 39L28 49Z" fill="${h}" stroke="${d}" stroke-width="1.1" stroke-linejoin="round"/>`
    }
    if (c.id === 'gojo') {
        return `<path d="M17 45L15 19L29 25L31 5L43 22L51 2L61 23L75 8L73 30L86 22L79 49L68 39L60 48L52 37L44 48L35 38L27 48Z" fill="${h}" stroke="${d}" stroke-width="1.1" stroke-linejoin="round"/>`
    }

    const fringe = `<path d="M17 52C15 24 33 10 50 10S85 24 83 52C76 39 71 33 64 29L59 42L53 27L47 41L40 28L35 40L28 32C23 39 20 46 17 52Z" fill="${h}"/>`
    const shine = `<path d="M32 22Q44 13 57 17" stroke="#fff" stroke-opacity=".32" stroke-width="3" stroke-linecap="round" fill="none"/>`
    const tips = c.hairAccent
        ? `<path d="M17 59L13 93H25L28 57ZM83 58L87 93H75L72 57Z" fill="${c.hairAccent}"/>`
        : ''
    return tips + fringe + shine
}

function accessoryBehind(c: Character) {
    if (c.accessory === 'straw-hat') {
        return `<path d="M12 31Q50 20 88 31L91 38Q50 46 9 38Z" fill="#d9a64a" stroke="#8b612e" stroke-width="1.5"/><path d="M29 10Q50 2 71 10L78 32H22Z" fill="#e8bd61" stroke="#8b612e" stroke-width="1.5"/><path d="M23 25Q50 31 77 25L78 31Q50 38 22 31Z" fill="#b94a43"/>`
    }
    return ''
}

function accessoryFront(c: Character) {
    switch (c.accessory) {
        case 'naruto-headband':
            return `<path d="M17 35Q50 27 83 35L82 45Q50 38 18 45Z" fill="#343a48" stroke="#202633" stroke-width="1.2"/><path d="M43 32L57 31L59 42L42 43Z" fill="#aeb6c1" stroke="#606b78" stroke-width="1"/><path d="M49 34L54 37L49 40L45 37Z" fill="none" stroke="#485462" stroke-width="1.4"/>`
        case 'gojo-blindfold':
            return `<path d="M17 47Q50 39 83 47L81 59Q50 53 19 59Z" fill="#171b28"/><path d="M20 48Q50 42 80 48" stroke="#596071" stroke-width="1.5" fill="none"/>`
        case 'nezuko-bamboo':
            return `<path d="M37 68Q50 62 63 68L62 76Q50 80 38 76Z" fill="#a9a06e" stroke="#625b3d" stroke-width="1.3"/><path d="M40 69L60 69M40 74L60 74" stroke="#645d40" stroke-width="1.2"/><path d="M37 66L33 63M63 66L67 63" stroke="#8e755b" stroke-width="2"/>`
        case 'yor-ornaments':
            return `<path d="M24 27L29 20L34 27L29 34Z M76 27L71 20L66 27L71 34Z" fill="#d9ad45" stroke="#9c742b" stroke-width="1.2"/><circle cx="29" cy="27" r="2" fill="#fff0bd"/><circle cx="71" cy="27" r="2" fill="#fff0bd"/>`
        default:
            return ''
    }
}

function eye(cx: number, c: Character) {
    if (c.accessory === 'gojo-blindfold') return ''
    return (
        `<ellipse cx="${cx}" cy="54" rx="6.2" ry="7.8" fill="#fff"/>` +
        `<ellipse cx="${cx}" cy="55" rx="4.8" ry="6.8" fill="${c.eye}"/>` +
        `<ellipse cx="${cx}" cy="56" rx="2.8" ry="4.4" fill="#211b27"/>` +
        `<circle cx="${cx + 1.8}" cy="51.5" r="2" fill="#fff"/>` +
        `<path d="M${cx - 8} 49.5Q${cx} 45 ${cx + 8} 49.5" stroke="#28212b" stroke-width="2.2" stroke-linecap="round" fill="none"/>`
    )
}

export function avatarSvg(c: Character): string {
    const skinShade = shade(c.skin, -22)
    const cheekMarks = c.marks === 'naruto-whiskers'
        ? `<path d="M25 61L34 63M25 66L34 66M66 63L75 61M66 66L75 66" stroke="#a96f55" stroke-width="1.5" stroke-linecap="round"/>`
        : ''
    const scarf = c.accessory === 'mikasa-scarf'
        ? `<path d="M22 79Q50 72 78 79L87 100H13Z" fill="#9e403d"/><path d="M25 82Q50 88 75 82" stroke="#c56b61" stroke-width="2" fill="none"/>`
        : ''
    const faceCover = c.accessory === 'nezuko-bamboo' ? accessoryFront(c) : ''

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${c.name} from ${c.anime}">` +
        `<defs><clipPath id="clip-${c.id}"><circle cx="50" cy="50" r="50"/></clipPath></defs>` +
        `<g clip-path="url(#clip-${c.id})">` +
        `<rect width="100" height="100" fill="${c.bg}"/>` +
        accessoryBehind(c) +
        hairBack(c) +
        `<path d="M10 103C13 82 29 77 50 77S87 82 90 103Z" fill="${c.outfit}"/>` +
        `<path d="M42 77L50 88L58 77Z" fill="#fff" opacity=".85"/>` +
        scarf +
        `<rect x="43" y="67" width="14" height="15" fill="${skinShade}"/>` +
        `<path d="M25 47C25 29 36 21 50 21S75 29 75 47C75 65 65 77 50 77S25 65 25 47Z" fill="${c.skin}"/>` +
        `<ellipse cx="31" cy="64" rx="5" ry="3" fill="#ff8198" opacity=".32"/><ellipse cx="69" cy="64" rx="5" ry="3" fill="#ff8198" opacity=".32"/>` +
        cheekMarks +
        eye(38, c) + eye(62, c) +
        `<path d="M50 63L49 66" stroke="${skinShade}" stroke-width="1.4" stroke-linecap="round"/>` +
        (c.accessory === 'nezuko-bamboo' ? '' : `<path d="M45 70Q50 73 55 70" stroke="#a94f54" stroke-width="1.8" stroke-linecap="round" fill="none"/>`) +
        hairFront(c) +
        (c.accessory === 'mikasa-scarf' ? '' : accessoryFront(c)) +
        faceCover +
        `</g></svg>`
    )
}
