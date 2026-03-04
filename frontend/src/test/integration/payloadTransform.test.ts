/**
 * API Payload Transformation Integration Tests
 *
 * Verifies that transformWizardToPayload correctly converts wizard store state
 * into the CreateCharacterData payload expected by the character creation API.
 */

import { describe, it, expect } from 'vitest';

import { transformWizardToPayload } from '@/utils/transformWizardToPayload';
import type { WizardState } from '@/stores/wizardStore';
import type { RaceSelection } from '@/types/race';
import type { ClassSelection } from '@/types/class';
import type { BackgroundSelection } from '@/types/background';
import type { AbilityScores } from '@/types/core';
import type { InventoryItem } from '@/types/equipment';

// ---------------------------------------------------------------------------
// Fixture: Complete Human Fighter Wizard State
// ---------------------------------------------------------------------------

function buildHumanFighterWizardState(): WizardState {
  const raceSelection: RaceSelection = {
    raceId: 'human',
  };

  const classSelection: ClassSelection = {
    classId: 'fighter',
    level: 1,
    chosenSkills: ['athletics', 'intimidation'],
    chosenFightingStyle: 'defense',
    hpRolls: [],
  };

  const abilityScores: AbilityScores = {
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 10,
    charisma: 8,
  };

  const backgroundSelection: BackgroundSelection = {
    backgroundId: 'soldier',
    characterIdentity: {
      name: 'Aldric the Bold',
      age: '28',
      height: "6'1\"",
    },
    characterPersonality: {
      personalityTraits: ['Brave beyond measure', 'Always first into battle'],
      ideal: 'Honor above all',
      bond: 'My fallen comrades',
      flaw: 'I never back down from a fight',
    },
  };

  const equipment: InventoryItem[] = [
    {
      id: 'inv-chain-mail',
      equipmentId: 'chain-mail',
      name: 'Chain Mail',
      category: 'armor',
      quantity: 1,
      weight: 55,
      isEquipped: true,
      isAttuned: false,
      requiresAttunement: false,
    },
    {
      id: 'inv-shield',
      equipmentId: 'shield',
      name: 'Shield',
      category: 'shield',
      quantity: 1,
      weight: 6,
      isEquipped: true,
      isAttuned: false,
      requiresAttunement: false,
    },
    {
      id: 'inv-longsword',
      equipmentId: 'longsword',
      name: 'Longsword',
      category: 'weapon',
      quantity: 1,
      weight: 3,
      isEquipped: true,
      isAttuned: false,
      requiresAttunement: false,
    },
  ];

  return {
    currentStep: 7, // Review step
    characterName: 'Aldric the Bold',
    raceSelection,
    classSelection,
    abilityScores,
    abilityScoreMethod: 'standard',
    backgroundSelection,
    equipmentSelections: equipment,
    spellSelections: [], // Fighter has no spells
    isComplete: true,
  };
}

// ---------------------------------------------------------------------------
// Fixture: Complete High Elf Wizard Wizard State
// ---------------------------------------------------------------------------

function buildHighElfWizardWizardState(): WizardState {
  const raceSelection: RaceSelection = {
    raceId: 'elf',
    subraceId: 'high-elf',
    chosenCantrip: 'light',
  };

  const classSelection: ClassSelection = {
    classId: 'wizard',
    level: 1,
    chosenSkills: ['arcana', 'investigation'],
    hpRolls: [],
  };

  const abilityScores: AbilityScores = {
    strength: 8,
    dexterity: 12,
    constitution: 14,
    intelligence: 15,
    wisdom: 13,
    charisma: 10,
  };

  const backgroundSelection: BackgroundSelection = {
    backgroundId: 'sage',
    characterIdentity: {
      name: 'Elyndra Starweaver',
      age: '145',
    },
    characterPersonality: {
      personalityTraits: ['Always lost in thought', 'I speak slowly and deliberately'],
      ideal: 'Knowledge is the path to power',
      bond: 'My spellbook is my most prized possession',
      flaw: 'I overlook obvious solutions in favor of complex ones',
    },
  };

  const equipment: InventoryItem[] = [
    {
      id: 'inv-quarterstaff',
      equipmentId: 'quarterstaff',
      name: 'Quarterstaff',
      category: 'weapon',
      quantity: 1,
      weight: 4,
      isEquipped: true,
      isAttuned: false,
      requiresAttunement: false,
    },
    {
      id: 'inv-arcane-focus',
      equipmentId: 'arcane-focus',
      name: 'Arcane Focus',
      category: 'adventuring-gear',
      quantity: 1,
      weight: 1,
      isEquipped: true,
      isAttuned: false,
      requiresAttunement: false,
    },
    {
      id: 'inv-spellbook',
      equipmentId: 'spellbook',
      name: 'Spellbook',
      category: 'adventuring-gear',
      quantity: 1,
      weight: 3,
      isEquipped: false,
      isAttuned: false,
      requiresAttunement: false,
    },
  ];

  const spellSelections = [
    'magic-missile',
    'shield',
    'detect-magic',
    'mage-armor',
    'sleep',
    'find-familiar',
  ];

  return {
    currentStep: 7,
    characterName: 'Elyndra Starweaver',
    raceSelection,
    classSelection,
    abilityScores,
    abilityScoreMethod: 'standard',
    backgroundSelection,
    equipmentSelections: equipment,
    spellSelections,
    isComplete: true,
  };
}

// ---------------------------------------------------------------------------
// Fixture: Empty/Default Wizard State
// ---------------------------------------------------------------------------

function buildEmptyWizardState(): WizardState {
  return {
    currentStep: 0,
    characterName: '',
    raceSelection: null,
    classSelection: null,
    abilityScores: null,
    abilityScoreMethod: null,
    backgroundSelection: null,
    equipmentSelections: [],
    spellSelections: [],
    isComplete: false,
  };
}

// ---------------------------------------------------------------------------
// Tests: Human Fighter Payload
// ---------------------------------------------------------------------------

describe('Transform Human Fighter Wizard State', () => {
  it('produces a payload with correct character name', () => {
    const state = buildHumanFighterWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.name).toBe('Aldric the Bold');
  });

  it('produces a payload with correct race selection', () => {
    const state = buildHumanFighterWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.race.raceId).toBe('human');
  });

  it('produces a payload with correct class selection', () => {
    const state = buildHumanFighterWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.classes).toHaveLength(1);
    expect(payload.classes[0].classId).toBe('fighter');
    expect(payload.classes[0].level).toBe(1);
    expect(payload.classes[0].chosenSkills).toEqual(['athletics', 'intimidation']);
    expect(payload.classes[0].chosenFightingStyle).toBe('defense');
  });

  it('produces a payload with correct ability scores', () => {
    const state = buildHumanFighterWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.baseAbilityScores).toEqual({
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 12,
      wisdom: 10,
      charisma: 8,
    });
    expect(payload.abilityScoreMethod).toBe('standard');
  });

  it('produces a payload with correct background', () => {
    const state = buildHumanFighterWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.background.backgroundId).toBe('soldier');
    expect(payload.background.characterPersonality.ideal).toBe('Honor above all');
  });

  it('includes equipment selections', () => {
    const state = buildHumanFighterWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.inventory).toHaveLength(3);
    expect(payload.inventory[0].name).toBe('Chain Mail');
    expect(payload.inventory[1].name).toBe('Shield');
    expect(payload.inventory[2].name).toBe('Longsword');
  });

  it('has null spellcasting for non-caster', () => {
    const state = buildHumanFighterWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.spellcasting).toBeNull();
  });

  it('includes all required top-level fields', () => {
    const state = buildHumanFighterWizardState();
    const payload = transformWizardToPayload(state);

    // Required fields from CreateCharacterData
    expect(payload).toHaveProperty('name');
    expect(payload).toHaveProperty('playerName');
    expect(payload).toHaveProperty('race');
    expect(payload).toHaveProperty('classes');
    expect(payload).toHaveProperty('background');
    expect(payload).toHaveProperty('alignment');
    expect(payload).toHaveProperty('baseAbilityScores');
    expect(payload).toHaveProperty('abilityScoreMethod');
    expect(payload).toHaveProperty('experiencePoints');
    expect(payload).toHaveProperty('hpMax');
    expect(payload).toHaveProperty('hpCurrent');
    expect(payload).toHaveProperty('tempHp');
    expect(payload).toHaveProperty('speed');
    expect(payload).toHaveProperty('deathSaves');
    expect(payload).toHaveProperty('proficiencies');
    expect(payload).toHaveProperty('inventory');
    expect(payload).toHaveProperty('currency');
    expect(payload).toHaveProperty('attunedItems');
    expect(payload).toHaveProperty('spellcasting');
    expect(payload).toHaveProperty('features');
    expect(payload).toHaveProperty('feats');
    expect(payload).toHaveProperty('description');
    expect(payload).toHaveProperty('personality');
    expect(payload).toHaveProperty('conditions');
    expect(payload).toHaveProperty('inspiration');
    expect(payload).toHaveProperty('campaignId');
    expect(payload).toHaveProperty('isArchived');
  });
});

// ---------------------------------------------------------------------------
// Tests: High Elf Wizard Payload
// ---------------------------------------------------------------------------

describe('Transform High Elf Wizard Wizard State', () => {
  it('produces a payload with correct character name', () => {
    const state = buildHighElfWizardWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.name).toBe('Elyndra Starweaver');
  });

  it('produces a payload with correct race and subrace', () => {
    const state = buildHighElfWizardWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.race.raceId).toBe('elf');
    expect(payload.race.subraceId).toBe('high-elf');
    expect(payload.race.chosenCantrip).toBe('light');
  });

  it('produces a payload with correct class selection', () => {
    const state = buildHighElfWizardWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.classes).toHaveLength(1);
    expect(payload.classes[0].classId).toBe('wizard');
    expect(payload.classes[0].level).toBe(1);
    expect(payload.classes[0].chosenSkills).toEqual(['arcana', 'investigation']);
  });

  it('includes spell selections in spellcasting data', () => {
    const state = buildHighElfWizardWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.spellcasting).not.toBeNull();
    expect(payload.spellcasting!.knownSpells).toEqual([
      'magic-missile',
      'shield',
      'detect-magic',
      'mage-armor',
      'sleep',
      'find-familiar',
    ]);
    expect(payload.spellcasting!.type).toBe('known');
    expect(payload.spellcasting!.ability).toBe('intelligence');
  });

  it('includes equipment selections', () => {
    const state = buildHighElfWizardWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.inventory).toHaveLength(3);
    expect(payload.inventory.map((i) => i.name)).toEqual([
      'Quarterstaff',
      'Arcane Focus',
      'Spellbook',
    ]);
  });

  it('uses personality from background selection', () => {
    const state = buildHighElfWizardWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.personality.personalityTraits).toEqual([
      'Always lost in thought',
      'I speak slowly and deliberately',
    ]);
    expect(payload.personality.ideal).toBe('Knowledge is the path to power');
  });

  it('uses description name from character name', () => {
    const state = buildHighElfWizardWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.description.name).toBe('Elyndra Starweaver');
  });
});

// ---------------------------------------------------------------------------
// Tests: Empty/Default State
// ---------------------------------------------------------------------------

describe('Empty/Default Wizard State Produces Valid Defaults', () => {
  it('produces a payload with empty name', () => {
    const state = buildEmptyWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.name).toBe('');
  });

  it('uses fallback race selection with empty raceId', () => {
    const state = buildEmptyWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.race).toEqual({ raceId: '' });
  });

  it('uses empty classes array when no class selected', () => {
    const state = buildEmptyWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.classes).toEqual([]);
  });

  it('uses default ability scores of all 10s when none provided', () => {
    const state = buildEmptyWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.baseAbilityScores).toEqual({
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    });
  });

  it('uses default abilityScoreMethod of standard when none selected', () => {
    const state = buildEmptyWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.abilityScoreMethod).toBe('standard');
  });

  it('has null spellcasting with no spell selections', () => {
    const state = buildEmptyWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.spellcasting).toBeNull();
  });

  it('has empty inventory with no equipment', () => {
    const state = buildEmptyWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.inventory).toEqual([]);
  });

  it('provides valid defaults for all required fields', () => {
    const state = buildEmptyWizardState();
    const payload = transformWizardToPayload(state);

    // Numeric defaults should be 0
    expect(payload.experiencePoints).toBe(0);
    expect(payload.hpMax).toBe(0);
    expect(payload.hpCurrent).toBe(0);
    expect(payload.tempHp).toBe(0);

    // Speed should have a default walk speed
    expect(payload.speed.walk).toBe(30);

    // Death saves should be zeroed
    expect(payload.deathSaves).toEqual({
      successes: 0,
      failures: 0,
      stable: false,
    });

    // Currency should be zeroed
    expect(payload.currency).toEqual({
      cp: 0, sp: 0, ep: 0, gp: 0, pp: 0,
    });

    // Boolean defaults
    expect(payload.inspiration).toBe(false);
    expect(payload.isArchived).toBe(false);
    expect(payload.campaignId).toBeNull();

    // Empty arrays
    expect(payload.features).toEqual([]);
    expect(payload.feats).toEqual([]);
    expect(payload.conditions).toEqual([]);
    expect(payload.attunedItems).toEqual([]);
    expect(payload.hitDiceTotal).toEqual([]);
    expect(payload.hitDiceUsed).toEqual([]);
  });

  it('provides default background with empty personality traits', () => {
    const state = buildEmptyWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.background.backgroundId).toBe('');
    expect(payload.background.characterPersonality.personalityTraits).toEqual(['', '']);
    expect(payload.background.characterPersonality.ideal).toBe('');
    expect(payload.background.characterPersonality.bond).toBe('');
    expect(payload.background.characterPersonality.flaw).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Tests: Spellcasting Payload Structure
// ---------------------------------------------------------------------------

describe('Spellcasting Payload Structure', () => {
  it('caster class includes spellcasting with all required fields', () => {
    const state = buildHighElfWizardWizardState();
    const payload = transformWizardToPayload(state);

    expect(payload.spellcasting).not.toBeNull();
    const sc = payload.spellcasting!;
    expect(sc).toHaveProperty('type');
    expect(sc).toHaveProperty('ability');
    expect(sc).toHaveProperty('cantrips');
    expect(sc).toHaveProperty('knownSpells');
    expect(sc).toHaveProperty('preparedSpells');
    expect(sc).toHaveProperty('spellSlots');
    expect(sc).toHaveProperty('usedSpellSlots');
    expect(sc).toHaveProperty('ritualCasting');
  });

  it('non-caster class has null spellcasting', () => {
    const state = buildHumanFighterWizardState();
    const payload = transformWizardToPayload(state);
    expect(payload.spellcasting).toBeNull();
  });

  it('spellcasting cantrips array is empty in initial payload (populated server-side)', () => {
    const state = buildHighElfWizardWizardState();
    const payload = transformWizardToPayload(state);
    // The transform puts spells into knownSpells, cantrips are empty
    expect(payload.spellcasting!.cantrips).toEqual([]);
  });
});
