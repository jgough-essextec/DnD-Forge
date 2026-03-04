/**
 * Character Generator for Stress Testing (Story 42.5)
 *
 * Generates realistic mock characters with varied classes, races, levels,
 * and equipment for performance stress testing.
 */

import type { GalleryCharacter } from '@/utils/gallery'

// ---------------------------------------------------------------------------
// Data pools
// ---------------------------------------------------------------------------

const RACE_NAMES = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome',
  'Half-Elf', 'Half-Orc', 'Tiefling', 'Dragonborn',
]

const CLASS_NAMES = [
  'Fighter', 'Wizard', 'Rogue', 'Cleric', 'Ranger',
  'Paladin', 'Barbarian', 'Bard', 'Druid', 'Monk',
  'Sorcerer', 'Warlock',
]

const FIRST_NAMES = [
  'Aragorn', 'Gandalf', 'Legolas', 'Gimli', 'Frodo',
  'Elara', 'Thorin', 'Lyra', 'Kael', 'Sera',
  'Aldric', 'Brynn', 'Cael', 'Dara', 'Ewan',
  'Fiona', 'Gareth', 'Hilda', 'Ivar', 'Jenna',
  'Kelvin', 'Luna', 'Magnus', 'Nira', 'Orin',
  'Petra', 'Quinn', 'Raven', 'Silas', 'Thane',
  'Uma', 'Vex', 'Wren', 'Xena', 'Yara', 'Zeph',
]

const CAMPAIGN_NAMES = [
  'Curse of Strahd', 'Lost Mine of Phandelver', 'Tomb of Annihilation',
  'Dragon of Icespire Peak', 'Waterdeep: Dragon Heist',
  null, null, null, // Some characters not in campaigns
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateId(index: number): string {
  return `stress-char-${String(index).padStart(4, '0')}`
}

function randomISODate(daysAgo: number): string {
  const now = Date.now()
  const offset = Math.random() * daysAgo * 24 * 60 * 60 * 1000
  return new Date(now - offset).toISOString()
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generate a single realistic mock character for gallery display.
 */
export function generateMockCharacter(index: number): GalleryCharacter {
  const level = randomInt(1, 20)
  const race = randomItem(RACE_NAMES)
  const cls = randomItem(CLASS_NAMES)
  const name = `${randomItem(FIRST_NAMES)} ${randomItem(['the Brave', 'Shadowstep', 'Ironforge', 'Starweaver', 'Flameheart', 'Stormborn', 'Nightwhisper', 'Dawnbringer', ''])}`.trim()
  const campaign = randomItem(CAMPAIGN_NAMES)

  // Rough HP approximation: hitDie average * level + con mod * level
  const hitDie = cls === 'Barbarian' ? 12 : cls === 'Wizard' || cls === 'Sorcerer' ? 6 : 8
  const conMod = randomInt(-1, 3)
  const maxHp = Math.max(1, hitDie + (level - 1) * Math.ceil(hitDie / 2 + 1) + conMod * level)
  const currentHp = randomInt(Math.floor(maxHp * 0.3), maxHp)

  // AC: typically 10-20
  const ac = randomInt(10, 20)

  return {
    id: generateId(index),
    name,
    race,
    class: cls,
    level,
    hp: { current: currentHp, max: maxHp },
    ac,
    avatarUrl: undefined,
    passivePerception: 10 + randomInt(-2, 5),
    updatedAt: randomISODate(90),
    createdAt: randomISODate(180),
    campaignId: campaign ? `campaign-${campaign.toLowerCase().replace(/\s+/g, '-')}` : null,
    campaignName: campaign,
    isArchived: Math.random() < 0.05, // 5% archived
  }
}

/**
 * Generate an array of mock characters.
 *
 * @param count - Number of characters to generate
 * @returns Array of GalleryCharacter objects
 */
export function generateMockCharacters(count: number): GalleryCharacter[] {
  return Array.from({ length: count }, (_, i) => generateMockCharacter(i))
}

// ---------------------------------------------------------------------------
// Combat fixtures
// ---------------------------------------------------------------------------

export interface StressCombatant {
  id: string
  name: string
  initiative: number
  hp: { current: number; max: number }
  ac: number
  isPlayer: boolean
  conditions: string[]
}

/**
 * Generate a large combat encounter with the specified number of combatants.
 *
 * @param partySize - Number of player characters (default: 8)
 * @param monsterCount - Number of monsters (default: 20)
 * @returns Array of combatants sorted by initiative
 */
export function generateCombatEncounter(
  partySize = 8,
  monsterCount = 20
): StressCombatant[] {
  const MONSTER_NAMES = [
    'Goblin', 'Orc', 'Skeleton', 'Zombie', 'Wolf',
    'Hobgoblin', 'Gnoll', 'Kobold', 'Bandit', 'Guard',
    'Ogre', 'Troll', 'Bugbear', 'Ghoul', 'Wight',
    'Wraith', 'Dire Wolf', 'Giant Spider', 'Harpy', 'Mimic',
  ]

  const CONDITIONS = [
    'Blinded', 'Charmed', 'Deafened', 'Frightened',
    'Grappled', 'Paralyzed', 'Poisoned', 'Prone',
    'Restrained', 'Stunned',
  ]

  const combatants: StressCombatant[] = []

  // Player characters
  for (let i = 0; i < partySize; i++) {
    const maxHp = randomInt(20, 120)
    combatants.push({
      id: `pc-${i}`,
      name: `${randomItem(FIRST_NAMES)} (${randomItem(CLASS_NAMES)})`,
      initiative: randomInt(1, 25),
      hp: { current: randomInt(1, maxHp), max: maxHp },
      ac: randomInt(12, 20),
      isPlayer: true,
      conditions: Math.random() < 0.2 ? [randomItem(CONDITIONS)] : [],
    })
  }

  // Monsters
  for (let i = 0; i < monsterCount; i++) {
    const monsterName = randomItem(MONSTER_NAMES)
    const maxHp = randomInt(5, 80)
    combatants.push({
      id: `monster-${i}`,
      name: `${monsterName} ${i + 1}`,
      initiative: randomInt(1, 20),
      hp: { current: randomInt(0, maxHp), max: maxHp },
      ac: randomInt(8, 18),
      isPlayer: false,
      conditions: Math.random() < 0.15 ? [randomItem(CONDITIONS)] : [],
    })
  }

  // Sort by initiative descending
  combatants.sort((a, b) => b.initiative - a.initiative)

  return combatants
}

// ---------------------------------------------------------------------------
// Campaign fixture
// ---------------------------------------------------------------------------

export interface StressSessionNote {
  id: string
  title: string
  content: string
  date: string
}

export interface StressNPC {
  id: string
  name: string
  description: string
  location: string
}

export interface StressLootItem {
  id: string
  name: string
  value: string
  assignedTo: string | null
}

export interface StressCampaignFixture {
  id: string
  name: string
  characters: GalleryCharacter[]
  sessionNotes: StressSessionNote[]
  npcs: StressNPC[]
  loot: StressLootItem[]
}

/**
 * Generate a large campaign fixture for stress testing.
 *
 * @param characterCount - Number of characters (default: 8)
 * @param sessionCount - Number of session notes (default: 20)
 * @param npcCount - Number of NPCs (default: 50)
 * @param lootCount - Number of loot items (default: 100)
 */
export function generateCampaignFixture(
  characterCount = 8,
  sessionCount = 20,
  npcCount = 50,
  lootCount = 100
): StressCampaignFixture {
  const NPC_LOCATIONS = [
    'Tavern', 'Market', 'Castle', 'Temple', 'Forest',
    'Cave', 'Tower', 'Village', 'Dungeon', 'Ship',
  ]

  const LOOT_NAMES = [
    'Longsword +1', 'Potion of Healing', 'Ring of Protection',
    'Cloak of Elvenkind', 'Bag of Holding', 'Wand of Magic Missiles',
    'Boots of Speed', 'Amulet of Health', 'Shield +2', 'Staff of Fire',
    'Gold Coins', 'Silver Coins', 'Gemstone', 'Scroll', 'Potion',
  ]

  const characters = generateMockCharacters(characterCount)

  const sessionNotes: StressSessionNote[] = Array.from(
    { length: sessionCount },
    (_, i) => ({
      id: `session-${i}`,
      title: `Session ${i + 1}: ${randomItem(['The Dark Forest', 'Dragon\'s Lair', 'City of Shadows', 'The Final Battle', 'Into the Unknown', 'The Betrayal', 'A New Dawn', 'The Siege', 'Lost Temple', 'Crossing the River'])}`,
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(
        randomInt(5, 20)
      ),
      date: randomISODate(180),
    })
  )

  const npcs: StressNPC[] = Array.from({ length: npcCount }, (_, i) => ({
    id: `npc-${i}`,
    name: `${randomItem(FIRST_NAMES)} ${randomItem(['Ironhand', 'Silvtongue', 'Darkcloak', 'Brightforge', 'Thunderstrike'])}`,
    description: 'A mysterious figure who lurks in the shadows. '.repeat(
      randomInt(1, 5)
    ),
    location: randomItem(NPC_LOCATIONS),
  }))

  const loot: StressLootItem[] = Array.from({ length: lootCount }, (_, i) => ({
    id: `loot-${i}`,
    name: randomItem(LOOT_NAMES),
    value: `${randomInt(1, 5000)} gp`,
    assignedTo:
      Math.random() < 0.6 ? characters[randomInt(0, characters.length - 1)]?.name ?? null : null,
  }))

  return {
    id: 'stress-campaign-1',
    name: 'Stress Test Campaign',
    characters,
    sessionNotes,
    npcs,
    loot,
  }
}
