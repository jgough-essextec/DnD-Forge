// =============================================================================
// Story 16.2 -- Game Terms Dictionary
// ~50 D&D 5e game terms with definitions and categories for tooltip system.
// =============================================================================

export interface GameTerm {
  term: string
  definition: string
  category?: string
}

export const GAME_TERMS: Record<string, GameTerm> = {
  'proficiency-bonus': {
    term: 'Proficiency Bonus',
    definition:
      'A bonus added to d20 rolls for attacks, saving throws, ability checks, and spell save DCs when you are proficient. It starts at +2 at level 1 and increases as you level up.',
    category: 'general',
  },
  'saving-throw': {
    term: 'Saving Throw',
    definition:
      'A d20 roll made to resist a spell, trap, poison, disease, or similar threat. You add your ability modifier and proficiency bonus (if proficient) to the roll.',
    category: 'combat',
  },
  'ability-check': {
    term: 'Ability Check',
    definition:
      'A d20 roll made to determine whether a task succeeds. You add the relevant ability modifier and any applicable proficiency bonus.',
    category: 'abilities',
  },
  'ability-modifier': {
    term: 'Ability Modifier',
    definition:
      'A number derived from an ability score, calculated as (score - 10) / 2 (rounded down). This modifier is added to many d20 rolls and other calculations.',
    category: 'abilities',
  },
  'ability-score': {
    term: 'Ability Score',
    definition:
      'One of six core attributes (Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma) that define a character\'s capabilities. Scores typically range from 1 to 20.',
    category: 'abilities',
  },
  'cantrip': {
    term: 'Cantrip',
    definition:
      'A spell that can be cast at will, without using a spell slot or being prepared. Cantrips are level 0 spells that grow stronger as the caster gains levels.',
    category: 'magic',
  },
  'spell-slot': {
    term: 'Spell Slot',
    definition:
      'A resource used to cast spells of 1st level or higher. Each spell slot has a level, and casting a spell uses a slot of the spell\'s level or higher. Slots are regained after a long rest.',
    category: 'magic',
  },
  'hit-die': {
    term: 'Hit Die',
    definition:
      'A die rolled to determine hit points gained on leveling up and to heal during a short rest. The die type depends on your class (e.g., d6 for Wizard, d10 for Fighter).',
    category: 'combat',
  },
  'hit-points': {
    term: 'Hit Points',
    definition:
      'A numerical measure of a creature\'s vitality. When hit points drop to 0, the creature falls unconscious or dies. Hit points are determined by class hit dice, Constitution modifier, and level.',
    category: 'combat',
  },
  'armor-class': {
    term: 'Armor Class',
    definition:
      'A number representing how hard a creature is to hit with an attack. An attack roll must meet or exceed the target\'s AC to hit. AC is determined by armor, Dexterity modifier, and other bonuses.',
    category: 'combat',
  },
  'initiative': {
    term: 'Initiative',
    definition:
      'A Dexterity check made at the start of combat to determine turn order. Higher initiative means acting earlier in each round.',
    category: 'combat',
  },
  'darkvision': {
    term: 'Darkvision',
    definition:
      'The ability to see in darkness as if it were dim light, and in dim light as if it were bright light, up to a specified range. Colors appear as shades of gray.',
    category: 'general',
  },
  'proficiency': {
    term: 'Proficiency',
    definition:
      'Training in a particular skill, tool, weapon, armor, or saving throw. When proficient, you add your proficiency bonus to related d20 rolls.',
    category: 'general',
  },
  'expertise': {
    term: 'Expertise',
    definition:
      'A class feature (Rogues, Bards, and some others) that doubles the proficiency bonus for specific skill checks. Your proficiency bonus is added twice instead of once.',
    category: 'general',
  },
  'advantage': {
    term: 'Advantage',
    definition:
      'When you have advantage on a d20 roll, you roll two d20s and take the higher result. Advantage and disadvantage cancel each other out.',
    category: 'combat',
  },
  'disadvantage': {
    term: 'Disadvantage',
    definition:
      'When you have disadvantage on a d20 roll, you roll two d20s and take the lower result. Advantage and disadvantage cancel each other out.',
    category: 'combat',
  },
  'attack-roll': {
    term: 'Attack Roll',
    definition:
      'A d20 roll made to determine if an attack hits a target. Add your ability modifier and proficiency bonus (if proficient with the weapon). A natural 20 is always a critical hit.',
    category: 'combat',
  },
  'damage-roll': {
    term: 'Damage Roll',
    definition:
      'The dice rolled to determine how much damage an attack deals. You add your ability modifier (Strength for melee, Dexterity for ranged or finesse). Critical hits double the damage dice.',
    category: 'combat',
  },
  'spell-save-dc': {
    term: 'Spell Save DC',
    definition:
      'The Difficulty Class an enemy must meet or beat on a saving throw to resist your spell. Calculated as 8 + proficiency bonus + spellcasting ability modifier.',
    category: 'magic',
  },
  'concentration': {
    term: 'Concentration',
    definition:
      'Some spells require concentration to maintain their effects. Taking damage requires a Constitution saving throw (DC 10 or half the damage, whichever is higher) to maintain concentration.',
    category: 'magic',
  },
  'ritual': {
    term: 'Ritual',
    definition:
      'A spell with the ritual tag can be cast using 10 extra minutes of casting time without expending a spell slot. Not all casters can cast rituals.',
    category: 'magic',
  },
  'short-rest': {
    term: 'Short Rest',
    definition:
      'A period of downtime, at least 1 hour long, during which a character can spend Hit Dice to regain hit points and recover some class features.',
    category: 'general',
  },
  'long-rest': {
    term: 'Long Rest',
    definition:
      'A period of extended downtime, at least 8 hours long, during which a character regains all hit points, up to half their total Hit Dice, and most expended spell slots and class features.',
    category: 'general',
  },
  'death-saves': {
    term: 'Death Saving Throws',
    definition:
      'When you start your turn at 0 hit points, you must make a special saving throw (DC 10). Three successes stabilize you; three failures kill you. A natural 20 restores 1 HP.',
    category: 'combat',
  },
  'inspiration': {
    term: 'Inspiration',
    definition:
      'A reward granted by the DM for good roleplaying, clever ideas, or heroic actions. You can spend inspiration to gain advantage on one attack roll, saving throw, or ability check.',
    category: 'general',
  },
  'race': {
    term: 'Race',
    definition:
      'Your character\'s species or ancestry (e.g., Human, Elf, Dwarf). Race determines ability score increases, size, speed, languages, and special traits like darkvision or resistances.',
    category: 'character',
  },
  'subrace': {
    term: 'Subrace',
    definition:
      'A variant within a race that provides additional traits and ability score bonuses. For example, High Elf and Wood Elf are subraces of Elf.',
    category: 'character',
  },
  'class': {
    term: 'Class',
    definition:
      'Your character\'s profession or calling (e.g., Fighter, Wizard, Rogue). Class determines hit dice, proficiencies, features, and available spells.',
    category: 'character',
  },
  'subclass': {
    term: 'Subclass',
    definition:
      'A specialization within a class chosen at a specified level (usually 1st-3rd). For example, Champion and Battle Master are Fighter subclasses.',
    category: 'character',
  },
  'background': {
    term: 'Background',
    definition:
      'Your character\'s history before adventuring (e.g., Acolyte, Criminal, Noble). Background provides skill proficiencies, tool proficiencies, languages, and starting equipment.',
    category: 'character',
  },
  'alignment': {
    term: 'Alignment',
    definition:
      'A two-axis moral compass combining law/chaos and good/evil (e.g., Lawful Good, Chaotic Neutral). Alignment is a guide for roleplaying, not a strict rule.',
    category: 'character',
  },
  'level': {
    term: 'Level',
    definition:
      'A measure of a character\'s experience and power. Characters start at level 1 and can advance to level 20. Each level grants new features, hit points, and other improvements.',
    category: 'character',
  },
  'experience-points': {
    term: 'Experience Points (XP)',
    definition:
      'Points earned by defeating monsters, completing quests, and overcoming challenges. Accumulating XP allows a character to advance to the next level.',
    category: 'general',
  },
  'strength': {
    term: 'Strength (STR)',
    definition:
      'Measures physical power. Affects melee attack rolls and damage, Athletics checks, carrying capacity, and Strength saving throws.',
    category: 'abilities',
  },
  'dexterity': {
    term: 'Dexterity (DEX)',
    definition:
      'Measures agility and reflexes. Affects ranged attack rolls, AC, initiative, Acrobatics and Stealth checks, and Dexterity saving throws.',
    category: 'abilities',
  },
  'constitution': {
    term: 'Constitution (CON)',
    definition:
      'Measures endurance and health. Affects hit points gained per level, concentration checks, and Constitution saving throws. Does not have associated skills.',
    category: 'abilities',
  },
  'intelligence': {
    term: 'Intelligence (INT)',
    definition:
      'Measures reasoning and memory. Used as the spellcasting ability for Wizards. Affects Arcana, History, Investigation, Nature, and Religion checks.',
    category: 'abilities',
  },
  'wisdom': {
    term: 'Wisdom (WIS)',
    definition:
      'Measures perception and intuition. Used as the spellcasting ability for Clerics, Druids, and Rangers. Affects Insight, Medicine, Perception, and Survival checks.',
    category: 'abilities',
  },
  'charisma': {
    term: 'Charisma (CHA)',
    definition:
      'Measures force of personality. Used as the spellcasting ability for Bards, Paladins, Sorcerers, and Warlocks. Affects Deception, Intimidation, Performance, and Persuasion checks.',
    category: 'abilities',
  },
  'spellcasting-ability': {
    term: 'Spellcasting Ability',
    definition:
      'The ability score used for spell attacks and spell save DCs. Intelligence for Wizards, Wisdom for Clerics/Druids/Rangers, and Charisma for Bards/Paladins/Sorcerers/Warlocks.',
    category: 'magic',
  },
  'spell-attack': {
    term: 'Spell Attack',
    definition:
      'A d20 roll to hit a target with a spell that requires an attack roll. You add your spellcasting ability modifier and proficiency bonus.',
    category: 'magic',
  },
  'prepared-spells': {
    term: 'Prepared Spells',
    definition:
      'Some casters (Clerics, Druids, Paladins, Wizards) must prepare a limited number of spells from their spell list after a long rest. Only prepared spells can be cast.',
    category: 'magic',
  },
  'skill': {
    term: 'Skill',
    definition:
      'A specific aspect of an ability score (e.g., Athletics for Strength, Stealth for Dexterity). Proficiency in a skill adds the proficiency bonus to related ability checks.',
    category: 'general',
  },
  'passive-perception': {
    term: 'Passive Perception',
    definition:
      'Your base awareness without actively searching, calculated as 10 + Wisdom modifier + proficiency bonus (if proficient in Perception). Used to detect hidden creatures and traps.',
    category: 'general',
  },
  'difficulty-class': {
    term: 'Difficulty Class (DC)',
    definition:
      'The number a d20 roll must meet or exceed to succeed on an ability check, saving throw, or similar roll. Higher DCs represent harder tasks.',
    category: 'general',
  },
  'critical-hit': {
    term: 'Critical Hit',
    definition:
      'A natural 20 on an attack roll always hits and deals extra damage. You roll the attack\'s damage dice twice and add them together, then add any modifiers.',
    category: 'combat',
  },
  'opportunity-attack': {
    term: 'Opportunity Attack',
    definition:
      'A special reaction attack triggered when a hostile creature moves out of your reach without taking the Disengage action. Uses your reaction for the round.',
    category: 'combat',
  },
  'point-buy': {
    term: 'Point Buy',
    definition:
      'A method for generating ability scores where you have 27 points to spend. Each score starts at 8, and increasing a score costs points (higher scores cost more). Maximum score is 15.',
    category: 'character',
  },
  'standard-array': {
    term: 'Standard Array',
    definition:
      'A fixed set of ability scores (15, 14, 13, 12, 10, 8) that you assign to your six abilities. Provides a balanced and predictable starting point.',
    category: 'character',
  },
  'multiclassing': {
    term: 'Multiclassing',
    definition:
      'Taking levels in more than one class. Requires meeting ability score prerequisites for both the current and new class. Provides variety at the cost of slower class progression.',
    category: 'character',
  },
  'feat': {
    term: 'Feat',
    definition:
      'An optional special ability chosen instead of an Ability Score Improvement at certain levels. Feats grant unique capabilities, bonuses, or new actions.',
    category: 'character',
  },
}

/**
 * Look up a game term by its ID.
 *
 * @param id - The hyphenated term ID (e.g., 'proficiency-bonus')
 * @returns The GameTerm object, or undefined if not found
 */
export function getGameTerm(id: string): GameTerm | undefined {
  return GAME_TERMS[id]
}

/**
 * Search game terms by query string. Matches against term name,
 * definition text, and category.
 *
 * @param query - The search query (case-insensitive)
 * @returns Array of matching GameTerm objects
 */
export function searchGameTerms(query: string): GameTerm[] {
  const lowerQuery = query.toLowerCase()
  return Object.values(GAME_TERMS).filter(
    (gt) =>
      gt.term.toLowerCase().includes(lowerQuery) ||
      gt.definition.toLowerCase().includes(lowerQuery) ||
      (gt.category && gt.category.toLowerCase().includes(lowerQuery)),
  )
}
