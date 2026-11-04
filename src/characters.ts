export type Character = {
  id: string
  name: string
  title: string // short description shown in the picker
  image: string // file name inside public/avatars
}

// The portraits live in public/avatars. To add a character, drop a square
// image in that folder and add a line here.
export const CHARACTERS: Character[] = [
  { id: 'akira', name: 'Akira', title: 'Warrior', image: 'akira_warrior.png' },
  { id: 'dante', name: 'Dante', title: 'Hunter', image: 'dante_hunter.png' },
  { id: 'kael', name: 'Kael', title: 'Assassin', image: 'kael_assassin.png' },
  { id: 'kairo', name: 'Kairo', title: 'Shadow', image: 'kairo_shadow.png' },
  { id: 'mira', name: 'Mira', title: 'Guardian', image: 'mira_guardian.png' },
  { id: 'razen', name: 'Razen', title: 'Emperor', image: 'razen_emperor.png' },
  { id: 'ryo', name: 'Ryo', title: 'Hero', image: 'ryo_hero.png' },
  { id: 'zev', name: 'Zev', title: 'Sorcerer', image: 'zev_sorcerer.png' },
]