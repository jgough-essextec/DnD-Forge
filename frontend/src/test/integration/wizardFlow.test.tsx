/**
 * Wizard Flow Integration Tests
 *
 * Exercises the full character creation wizard flow at the store + utility level,
 * verifying that wizard state persists across steps, transforms correctly into
 * API payloads, and validates correctly for different class/race combinations.
 *
 * These tests integrate the Zustand wizard store, the transform utility, the
 * validation engine, and the calculation engine to verify the complete flow.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';

import { useWizardStore } from '@/stores/wizardStore';
import { transformWizardToPayload } from '@/utils/transformWizardToPayload';
import { validateCharacter } from '@/utils/calculations/validation';
import {
  getModifier,
  getMaxHitPoints,
  getArmorClass,
  getProficiencyBonus,
  getSpellSaveDC,
  getSpellAttackBonus,
} from '@/utils/calculations';
import { CLASSES, getClassById } from '@/data/classes';
import { races } from '@/data/races';
import type { RaceSelection } from '@/types/race';
import type { ClassSelection } from '@/types/class';
import type { BackgroundSelection } from '@/types/background';
import type { AbilityScores } from '@/types/core';
import type { InventoryItem } from '@/types/equipment';
import type { Character } from '@/types/character';

// ---------------------------------------------------------------------------
// Store Reset
// ---------------------------------------------------------------------------

beforeEach(() => {
  act(() => {
    useWizardStore.getState().reset();
  });
});

// ---------------------------------------------------------------------------
// Complete Human Fighter Wizard Flow
// ---------------------------------------------------------------------------

describe('Complete Human Fighter Wizard Flow', () => {
  const humanRace: RaceSelection = {
    raceId: 'human',
  };

  const fighterClass: ClassSelection = {
    classId: 'fighter',
    level: 1,
    chosenSkills: ['athletics', 'intimidation'],
    chosenFightingStyle: 'defense',
    hpRolls: [],
  };

  const fighterAbilityScores: AbilityScores = {
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 10,
    charisma: 8,
  };

  const soldierBackground: BackgroundSelection = {
    backgroundId: 'soldier',
    characterIdentity: { name: 'Aldric the Bold' },
    characterPersonality: {
      personalityTraits: ['Brave beyond measure', 'Always first into battle'],
      ideal: 'Honor above all',
      bond: 'My fallen comrades',
      flaw: 'I never back down from a fight',
    },
  };

  const fighterEquipment: InventoryItem[] = [
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
  ];

  it('Step 0 (Intro): set character name', () => {
    act(() => {
      useWizardStore.getState().setCharacterName('Aldric the Bold');
      useWizardStore.getState().setStep(0);
    });

    const state = useWizardStore.getState();
    expect(state.characterName).toBe('Aldric the Bold');
    expect(state.currentStep).toBe(0);
  });

  it('Step 1 (Race): set Human race', () => {
    act(() => {
      useWizardStore.getState().setRace(humanRace);
      useWizardStore.getState().setStep(1);
    });

    const state = useWizardStore.getState();
    expect(state.raceSelection).toEqual(humanRace);
    expect(state.raceSelection!.raceId).toBe('human');
  });

  it('Step 2 (Class): set Fighter class', () => {
    act(() => {
      useWizardStore.getState().setClass(fighterClass);
      useWizardStore.getState().setStep(2);
    });

    const state = useWizardStore.getState();
    expect(state.classSelection).toEqual(fighterClass);
    expect(state.classSelection!.classId).toBe('fighter');
    expect(state.classSelection!.chosenFightingStyle).toBe('defense');
  });

  it('Step 3 (Abilities): set Standard Array ability scores', () => {
    act(() => {
      useWizardStore.getState().setAbilityScores(fighterAbilityScores, 'standard');
      useWizardStore.getState().setStep(3);
    });

    const state = useWizardStore.getState();
    expect(state.abilityScores).toEqual(fighterAbilityScores);
    expect(state.abilityScoreMethod).toBe('standard');
  });

  it('Step 4 (Background): set Soldier background', () => {
    act(() => {
      useWizardStore.getState().setBackground(soldierBackground);
      useWizardStore.getState().setStep(4);
    });

    const state = useWizardStore.getState();
    expect(state.backgroundSelection!.backgroundId).toBe('soldier');
  });

  it('Step 5 (Equipment): set starting equipment', () => {
    act(() => {
      useWizardStore.getState().setEquipment(fighterEquipment);
      useWizardStore.getState().setStep(5);
    });

    const state = useWizardStore.getState();
    expect(state.equipmentSelections).toHaveLength(2);
  });

  it('Step 6 (Spells): Fighter skips spell step (no spells)', () => {
    // Fighter has no spellcasting, so spells remain empty
    const state = useWizardStore.getState();
    expect(state.spellSelections).toEqual([]);

    // Verify Fighter class data has no spellcasting
    const fighterData = getClassById('fighter');
    expect(fighterData).toBeDefined();
    expect(fighterData!.spellcasting).toBeUndefined();
  });

  it('Step 7 (Review): complete flow produces valid payload', () => {
    // Set all wizard state
    act(() => {
      const store = useWizardStore.getState();
      store.setCharacterName('Aldric the Bold');
      store.setRace(humanRace);
      store.setClass(fighterClass);
      store.setAbilityScores(fighterAbilityScores, 'standard');
      store.setBackground(soldierBackground);
      store.setEquipment(fighterEquipment);
      store.setStep(7);
    });

    const state = useWizardStore.getState();
    expect(state.currentStep).toBe(7);

    // Transform to API payload
    const payload = transformWizardToPayload(state);
    expect(payload.name).toBe('Aldric the Bold');
    expect(payload.race.raceId).toBe('human');
    expect(payload.classes[0].classId).toBe('fighter');
    expect(payload.baseAbilityScores).toEqual(fighterAbilityScores);
    expect(payload.spellcasting).toBeNull();
    expect(payload.inventory).toHaveLength(2);
  });

  it('complete flow produces correct derived stats', () => {
    // Human racial bonuses: +1 to all
    const effectiveScores: AbilityScores = {
      strength: fighterAbilityScores.strength + 1,   // 16
      dexterity: fighterAbilityScores.dexterity + 1, // 15
      constitution: fighterAbilityScores.constitution + 1, // 14
      intelligence: fighterAbilityScores.intelligence + 1, // 13
      wisdom: fighterAbilityScores.wisdom + 1,       // 11
      charisma: fighterAbilityScores.charisma + 1,   // 9
    };

    // HP: Fighter d10, CON 14 (mod +2)
    const hp = getMaxHitPoints({
      hitDie: 10,
      level: 1,
      conModifier: getModifier(effectiveScores.constitution), // +2
    });
    expect(hp).toBe(12);

    // AC: Chain Mail (16) + Shield (+2) + Defense (+1) = 19
    const ac = getArmorClass({
      armor: { baseAC: 16, category: 'heavy', dexCap: 0 },
      shield: true,
      dexModifier: getModifier(effectiveScores.dexterity),
      defenseFightingStyle: true,
    });
    expect(ac).toBe(19);
  });
});

// ---------------------------------------------------------------------------
// Complete High Elf Wizard Wizard Flow
// ---------------------------------------------------------------------------

describe('Complete High Elf Wizard Wizard Flow', () => {
  const elfRace: RaceSelection = {
    raceId: 'elf',
    subraceId: 'high-elf',
    chosenCantrip: 'light',
  };

  const wizardClass: ClassSelection = {
    classId: 'wizard',
    level: 1,
    chosenSkills: ['arcana', 'investigation'],
    hpRolls: [],
  };

  const wizardAbilityScores: AbilityScores = {
    strength: 8,
    dexterity: 12,
    constitution: 14,
    intelligence: 15,
    wisdom: 13,
    charisma: 10,
  };

  const sageBackground: BackgroundSelection = {
    backgroundId: 'sage',
    characterIdentity: { name: 'Elyndra Starweaver' },
    characterPersonality: {
      personalityTraits: ['Always lost in thought', 'I speak slowly'],
      ideal: 'Knowledge is power',
      bond: 'My spellbook',
      flaw: 'Overthink everything',
    },
  };

  const wizardEquipment: InventoryItem[] = [
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
  ];

  const wizardSpells = [
    'magic-missile',
    'shield',
    'detect-magic',
    'mage-armor',
    'sleep',
    'find-familiar',
  ];

  it('complete caster flow sets spells correctly', () => {
    act(() => {
      const store = useWizardStore.getState();
      store.setCharacterName('Elyndra Starweaver');
      store.setRace(elfRace);
      store.setClass(wizardClass);
      store.setAbilityScores(wizardAbilityScores, 'standard');
      store.setBackground(sageBackground);
      store.setEquipment(wizardEquipment);
      store.setSpells(wizardSpells);
      store.setStep(7);
    });

    const state = useWizardStore.getState();
    expect(state.spellSelections).toEqual(wizardSpells);
    expect(state.spellSelections).toHaveLength(6);
  });

  it('complete flow produces payload with spellcasting data', () => {
    act(() => {
      const store = useWizardStore.getState();
      store.setCharacterName('Elyndra Starweaver');
      store.setRace(elfRace);
      store.setClass(wizardClass);
      store.setAbilityScores(wizardAbilityScores, 'standard');
      store.setBackground(sageBackground);
      store.setEquipment(wizardEquipment);
      store.setSpells(wizardSpells);
      store.setStep(7);
    });

    const payload = transformWizardToPayload(useWizardStore.getState());
    expect(payload.spellcasting).not.toBeNull();
    expect(payload.spellcasting!.knownSpells).toEqual(wizardSpells);
    expect(payload.spellcasting!.type).toBe('known');
    expect(payload.spellcasting!.ability).toBe('intelligence');
  });

  it('complete flow produces correct spellcasting stats', () => {
    // Elf: DEX +2, High Elf: INT +1
    const effectiveScores: AbilityScores = {
      strength: 8,
      dexterity: 14,  // 12 + 2
      constitution: 14,
      intelligence: 16, // 15 + 1
      wisdom: 13,
      charisma: 10,
    };

    // Spell Save DC: 8 + prof (2) + INT mod (+3) = 13
    const dc = getSpellSaveDC(
      getModifier(effectiveScores.intelligence),
      getProficiencyBonus(1),
    );
    expect(dc).toBe(13);

    // Spell Attack Bonus: prof (2) + INT mod (+3) = 5
    const attackBonus = getSpellAttackBonus(
      getModifier(effectiveScores.intelligence),
      getProficiencyBonus(1),
    );
    expect(attackBonus).toBe(5);

    // HP: Wizard d6, CON 14 (mod +2)
    const hp = getMaxHitPoints({
      hitDie: 6,
      level: 1,
      conModifier: getModifier(effectiveScores.constitution),
    });
    expect(hp).toBe(8);
  });
});

// ---------------------------------------------------------------------------
// State Persistence Across Steps
// ---------------------------------------------------------------------------

describe('Wizard State Persists Across Step Navigation', () => {
  it('state set in early steps persists when navigating forward', () => {
    act(() => {
      const store = useWizardStore.getState();
      store.setCharacterName('Test Hero');
      store.setStep(0);
    });

    // Navigate forward to step 1
    act(() => {
      useWizardStore.getState().setStep(1);
    });

    expect(useWizardStore.getState().characterName).toBe('Test Hero');
    expect(useWizardStore.getState().currentStep).toBe(1);

    // Set race at step 1
    act(() => {
      useWizardStore.getState().setRace({ raceId: 'human' });
    });

    // Navigate to step 2
    act(() => {
      useWizardStore.getState().setStep(2);
    });

    // Both name and race should persist
    expect(useWizardStore.getState().characterName).toBe('Test Hero');
    expect(useWizardStore.getState().raceSelection!.raceId).toBe('human');
    expect(useWizardStore.getState().currentStep).toBe(2);
  });

  it('state set in later steps persists when navigating backward', () => {
    act(() => {
      const store = useWizardStore.getState();
      store.setCharacterName('Test Hero');
      store.setRace({ raceId: 'elf', subraceId: 'high-elf' });
      store.setClass({
        classId: 'wizard',
        level: 1,
        chosenSkills: ['arcana', 'history'],
        hpRolls: [],
      });
      store.setAbilityScores({
        strength: 8,
        dexterity: 14,
        constitution: 14,
        intelligence: 16,
        wisdom: 12,
        charisma: 10,
      }, 'standard');
      store.setStep(4); // At background step
    });

    // Navigate backward to step 1 (race)
    act(() => {
      useWizardStore.getState().setStep(1);
    });

    // All previously set state should persist
    const state = useWizardStore.getState();
    expect(state.currentStep).toBe(1);
    expect(state.characterName).toBe('Test Hero');
    expect(state.raceSelection!.raceId).toBe('elf');
    expect(state.classSelection!.classId).toBe('wizard');
    expect(state.abilityScores!.intelligence).toBe(16);
  });

  it('modifying state on a revisited step updates correctly', () => {
    act(() => {
      const store = useWizardStore.getState();
      store.setRace({ raceId: 'human' });
      store.setStep(3);
    });

    // Go back and change race
    act(() => {
      useWizardStore.getState().setStep(1);
      useWizardStore.getState().setRace({ raceId: 'elf', subraceId: 'high-elf' });
    });

    const state = useWizardStore.getState();
    expect(state.raceSelection!.raceId).toBe('elf');
    expect(state.raceSelection!.subraceId).toBe('high-elf');
  });

  it('reset clears all wizard state', () => {
    act(() => {
      const store = useWizardStore.getState();
      store.setCharacterName('Will Be Reset');
      store.setRace({ raceId: 'human' });
      store.setClass({
        classId: 'fighter',
        level: 1,
        chosenSkills: ['athletics'],
        hpRolls: [],
      });
      store.setStep(5);
    });

    act(() => {
      useWizardStore.getState().reset();
    });

    const state = useWizardStore.getState();
    expect(state.currentStep).toBe(0);
    expect(state.characterName).toBe('');
    expect(state.raceSelection).toBeNull();
    expect(state.classSelection).toBeNull();
    expect(state.abilityScores).toBeNull();
    expect(state.abilityScoreMethod).toBeNull();
    expect(state.backgroundSelection).toBeNull();
    expect(state.equipmentSelections).toEqual([]);
    expect(state.spellSelections).toEqual([]);
    expect(state.isComplete).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Spellcasting Step Skip/Show Logic
// ---------------------------------------------------------------------------

describe('Spellcasting Step Skip/Show Logic', () => {
  const nonCasterClasses = ['barbarian', 'fighter', 'monk', 'rogue'];
  const casterClasses = ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard'];

  for (const classId of nonCasterClasses) {
    it(`${classId} has no spellcasting (spell step should be skipped)`, () => {
      const classData = getClassById(classId);
      expect(classData).toBeDefined();
      expect(classData!.spellcasting).toBeUndefined();

      // Verify that a payload with no spells yields null spellcasting
      act(() => {
        useWizardStore.getState().setClass({
          classId,
          level: 1,
          chosenSkills: [],
          hpRolls: [],
        });
      });

      const payload = transformWizardToPayload(useWizardStore.getState());
      expect(payload.spellcasting).toBeNull();
    });
  }

  for (const classId of casterClasses) {
    it(`${classId} has spellcasting (spell step should be shown)`, () => {
      const classData = getClassById(classId);
      expect(classData).toBeDefined();
      expect(classData!.spellcasting).toBeDefined();

      // Verify that a payload with spells yields non-null spellcasting
      act(() => {
        const store = useWizardStore.getState();
        store.reset();
        store.setClass({
          classId,
          level: 1,
          chosenSkills: [],
          hpRolls: [],
        });
        store.setSpells(['test-spell-1']);
      });

      const payload = transformWizardToPayload(useWizardStore.getState());
      expect(payload.spellcasting).not.toBeNull();
      expect(payload.spellcasting!.knownSpells).toContain('test-spell-1');
    });
  }
});

// ---------------------------------------------------------------------------
// Validation Catches Common Issues
// ---------------------------------------------------------------------------

describe('Validation Catches Missing Steps', () => {
  it('missing race produces validation error', () => {
    const character = buildCharacterFromWizardState({
      name: 'Test Character',
      raceId: '', // missing
      classId: 'fighter',
      abilityScores: {
        strength: 15, dexterity: 14, constitution: 13,
        intelligence: 12, wisdom: 10, charisma: 8,
      },
    });

    const entries = validateCharacter(character);
    expect(entries.some((e) => e.severity === 'error' && e.field === 'race')).toBe(true);
  });

  it('missing class produces validation error', () => {
    const character = buildCharacterFromWizardState({
      name: 'Test Character',
      raceId: 'human',
      classId: '', // will be excluded from classes array
      abilityScores: {
        strength: 15, dexterity: 14, constitution: 13,
        intelligence: 12, wisdom: 10, charisma: 8,
      },
    });

    const entries = validateCharacter(character);
    expect(entries.some((e) => e.severity === 'error' && e.field === 'classes')).toBe(true);
  });

  it('missing ability scores produces validation error', () => {
    const character = buildCharacterFromWizardState({
      name: 'Test Character',
      raceId: 'human',
      classId: 'fighter',
    });
    // Set ability scores to null to simulate missing
    (character as any).baseAbilityScores = null;

    const entries = validateCharacter(character);
    expect(entries.some((e) =>
      e.severity === 'error' && e.field === 'baseAbilityScores',
    )).toBe(true);
  });

  it('missing character name produces validation error', () => {
    const character = buildCharacterFromWizardState({
      name: '', // empty
      raceId: 'human',
      classId: 'fighter',
      abilityScores: {
        strength: 15, dexterity: 14, constitution: 13,
        intelligence: 12, wisdom: 10, charisma: 8,
      },
    });

    const entries = validateCharacter(character);
    expect(entries.some((e) => e.severity === 'error' && e.field === 'name')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// transformWizardToPayload for Both Character Types
// ---------------------------------------------------------------------------

describe('Payload Correctness for Both Character Types', () => {
  it('Human Fighter payload has no spellcasting and correct class', () => {
    act(() => {
      const store = useWizardStore.getState();
      store.setCharacterName('Aldric');
      store.setRace({ raceId: 'human' });
      store.setClass({
        classId: 'fighter',
        level: 1,
        chosenSkills: ['athletics', 'intimidation'],
        chosenFightingStyle: 'defense',
        hpRolls: [],
      });
      store.setAbilityScores({
        strength: 15, dexterity: 14, constitution: 13,
        intelligence: 12, wisdom: 10, charisma: 8,
      }, 'standard');
    });

    const payload = transformWizardToPayload(useWizardStore.getState());
    expect(payload.spellcasting).toBeNull();
    expect(payload.classes[0].classId).toBe('fighter');
    expect(payload.race.raceId).toBe('human');
  });

  it('High Elf Wizard payload has spellcasting and correct class', () => {
    act(() => {
      const store = useWizardStore.getState();
      store.setCharacterName('Elyndra');
      store.setRace({ raceId: 'elf', subraceId: 'high-elf' });
      store.setClass({
        classId: 'wizard',
        level: 1,
        chosenSkills: ['arcana', 'investigation'],
        hpRolls: [],
      });
      store.setAbilityScores({
        strength: 8, dexterity: 12, constitution: 14,
        intelligence: 15, wisdom: 13, charisma: 10,
      }, 'standard');
      store.setSpells(['magic-missile', 'shield', 'detect-magic']);
    });

    const payload = transformWizardToPayload(useWizardStore.getState());
    expect(payload.spellcasting).not.toBeNull();
    expect(payload.spellcasting!.knownSpells).toHaveLength(3);
    expect(payload.classes[0].classId).toBe('wizard');
    expect(payload.race.raceId).toBe('elf');
    expect(payload.race.subraceId).toBe('high-elf');
  });
});

// ---------------------------------------------------------------------------
// Race Data Verification
// ---------------------------------------------------------------------------

describe('Race Data Correctness', () => {
  it('all 9 SRD races are available', () => {
    expect(races).toHaveLength(9);
    const raceIds = races.map((r) => r.id);
    expect(raceIds).toContain('dwarf');
    expect(raceIds).toContain('elf');
    expect(raceIds).toContain('human');
    expect(raceIds).toContain('halfling');
    expect(raceIds).toContain('dragonborn');
    expect(raceIds).toContain('gnome');
    expect(raceIds).toContain('half-elf');
    expect(raceIds).toContain('half-orc');
    expect(raceIds).toContain('tiefling');
  });

  it('Human has +1 to all ability scores', () => {
    const human = races.find((r) => r.id === 'human')!;
    expect(human.abilityScoreIncrease).toEqual({
      strength: 1,
      dexterity: 1,
      constitution: 1,
      intelligence: 1,
      wisdom: 1,
      charisma: 1,
    });
  });

  it('High Elf subrace has +1 INT', () => {
    const elf = races.find((r) => r.id === 'elf')!;
    const highElf = elf.subraces.find((s) => s.id === 'high-elf')!;
    expect(highElf.abilityScoreIncrease).toEqual({ intelligence: 1 });
  });

  it('Elf base race has +2 DEX', () => {
    const elf = races.find((r) => r.id === 'elf')!;
    expect(elf.abilityScoreIncrease).toEqual({ dexterity: 2 });
  });
});

// ---------------------------------------------------------------------------
// Class Data Verification
// ---------------------------------------------------------------------------

describe('Class Data Correctness', () => {
  it('all 12 SRD classes are available', () => {
    expect(CLASSES).toHaveLength(12);
    const classIds = CLASSES.map((c) => c.id);
    expect(classIds).toContain('barbarian');
    expect(classIds).toContain('bard');
    expect(classIds).toContain('cleric');
    expect(classIds).toContain('druid');
    expect(classIds).toContain('fighter');
    expect(classIds).toContain('monk');
    expect(classIds).toContain('paladin');
    expect(classIds).toContain('ranger');
    expect(classIds).toContain('rogue');
    expect(classIds).toContain('sorcerer');
    expect(classIds).toContain('warlock');
    expect(classIds).toContain('wizard');
  });

  it('Fighter has d10 hit die and STR/CON saves', () => {
    const fighter = getClassById('fighter')!;
    expect(fighter.hitDie).toBe(10);
    expect(fighter.proficiencies.savingThrows).toEqual(['strength', 'constitution']);
  });

  it('Wizard has d6 hit die and INT/WIS saves', () => {
    const wizard = getClassById('wizard')!;
    expect(wizard.hitDie).toBe(6);
    expect(wizard.proficiencies.savingThrows).toEqual(['intelligence', 'wisdom']);
  });

  it('Wizard has full spellcasting with INT ability', () => {
    const wizard = getClassById('wizard')!;
    expect(wizard.spellcasting).toBeDefined();
    expect(wizard.spellcasting!.type).toBe('full');
    expect(wizard.spellcasting!.ability).toBe('intelligence');
  });
});

// ---------------------------------------------------------------------------
// Helper: Build a Character from partial wizard state for validation
// ---------------------------------------------------------------------------

function buildCharacterFromWizardState(params: {
  name: string;
  raceId: string;
  classId: string;
  abilityScores?: AbilityScores;
}): Character {
  const scores = params.abilityScores ?? {
    strength: 10, dexterity: 10, constitution: 10,
    intelligence: 10, wisdom: 10, charisma: 10,
  };

  return {
    id: 'test-character',
    name: params.name,
    playerName: 'Test Player',
    avatarUrl: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    version: 1,
    race: { raceId: params.raceId },
    classes: params.classId
      ? [{ classId: params.classId, level: 1, chosenSkills: [], hpRolls: [] }]
      : [],
    background: {
      backgroundId: 'soldier',
      characterIdentity: { name: params.name },
      characterPersonality: {
        personalityTraits: ['', ''],
        ideal: '',
        bond: '',
        flaw: '',
      },
    },
    alignment: 'true-neutral',
    baseAbilityScores: scores,
    abilityScores: scores,
    abilityScoreMethod: 'standard',
    level: 1,
    experiencePoints: 0,
    hpMax: 10,
    hpCurrent: 10,
    tempHp: 0,
    hitDiceTotal: [1],
    hitDiceUsed: [0],
    speed: { walk: 30 },
    deathSaves: { successes: 0, failures: 0, stable: false },
    combatStats: {
      armorClass: { base: 10, dexModifier: 0, shieldBonus: 0, otherBonuses: [], formula: '10' },
      initiative: 0,
      speed: { walk: 30 },
      hitPoints: { maximum: 10, current: 10, temporary: 0, hitDice: { total: [], used: [] } },
      attacks: [],
      savingThrows: {},
    },
    proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
      languages: ['common'],
      skills: [],
      savingThrows: [],
    },
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    attunedItems: [],
    spellcasting: null,
    features: [],
    feats: [],
    description: {
      name: params.name,
      age: '',
      height: '',
      weight: '',
      eyes: '',
      skin: '',
      hair: '',
      appearance: '',
      backstory: '',
      alliesAndOrgs: '',
      treasure: '',
    },
    personality: {
      personalityTraits: ['', ''],
      ideal: '',
      bond: '',
      flaw: '',
    },
    conditions: [],
    inspiration: false,
    campaignId: null,
    isArchived: false,
  };
}
