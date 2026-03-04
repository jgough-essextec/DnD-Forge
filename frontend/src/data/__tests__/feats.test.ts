/**
 * Tests for SRD Feat Data (Story 3.6)
 */
import { describe, it, expect } from 'vitest';
import {
  FEATS,
  getFeatById,
  getFeatsWithNoPrerequisites,
  getFeatsWithASI,
} from '@/data/feats';
import type { Feat } from '@/types';

describe('FEATS', () => {
  it('should export feats array with all 42 SRD feats', () => {
    expect(FEATS.length).toBe(42);
  });

  it('should have no duplicate feat IDs', () => {
    const ids = FEATS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have all expected SRD feats', () => {
    const expectedIds = [
      'alert', 'athlete', 'actor', 'charger', 'crossbow-expert',
      'defensive-duelist', 'dual-wielder', 'dungeon-delver', 'durable',
      'elemental-adept', 'grappler', 'great-weapon-master', 'healer',
      'heavily-armored', 'heavy-armor-master', 'inspiring-leader',
      'keen-mind', 'lightly-armored', 'linguist', 'lucky',
      'mage-slayer', 'magic-initiate', 'martial-adept',
      'medium-armor-master', 'mobile', 'moderately-armored',
      'mounted-combatant', 'observant', 'polearm-master', 'resilient',
      'ritual-caster', 'savage-attacker', 'sentinel', 'sharpshooter',
      'shield-master', 'skilled', 'skulker', 'spell-sniper',
      'tavern-brawler', 'tough', 'war-caster', 'weapon-master',
    ];
    const actualIds = FEATS.map((f) => f.id);
    for (const id of expectedIds) {
      expect(actualIds).toContain(id);
    }
  });

  it('should have Alert feat with no prerequisites', () => {
    const alert = getFeatById('alert');
    expect(alert).toBeDefined();
    expect(alert!.prerequisite).toBeUndefined();
    expect(alert!.mechanicalEffects.length).toBeGreaterThan(0);
  });

  it('should have Grappler with prerequisite STR 13', () => {
    const grappler = getFeatById('grappler');
    expect(grappler).toBeDefined();
    expect(grappler!.prerequisite).toBeDefined();
    expect(grappler!.prerequisite!.minAbilityScore).toBeDefined();
    expect(grappler!.prerequisite!.minAbilityScore!.strength).toBe(13);
  });

  it('should have Heavy Armor Master with prerequisite (armor proficiency)', () => {
    const ham = getFeatById('heavy-armor-master');
    expect(ham).toBeDefined();
    expect(ham!.prerequisite).toBeDefined();
    expect(ham!.prerequisite!.armorProficiency).toBe(true);
  });

  it('should have Defensive Duelist with prerequisite DEX 13', () => {
    const dd = getFeatById('defensive-duelist');
    expect(dd).toBeDefined();
    expect(dd!.prerequisite!.minAbilityScore!.dexterity).toBe(13);
  });

  it('should have feats with +1 ability score increase flagged correctly', () => {
    const featsWithASI = getFeatsWithASI();
    expect(featsWithASI.length).toBeGreaterThan(0);

    // Athlete should have STR or DEX +1
    const athlete = getFeatById('athlete');
    expect(athlete).toBeDefined();
    expect(athlete!.abilityScoreIncrease).toBeDefined();

    // Actor should have CHA +1
    const actor = getFeatById('actor');
    expect(actor).toBeDefined();
    expect(actor!.abilityScoreIncrease!.charisma).toBe(1);

    // Keen Mind should have INT +1
    const keenMind = getFeatById('keen-mind');
    expect(keenMind).toBeDefined();
    expect(keenMind!.abilityScoreIncrease!.intelligence).toBe(1);

    // Durable should have CON +1
    const durable = getFeatById('durable');
    expect(durable).toBeDefined();
    expect(durable!.abilityScoreIncrease!.constitution).toBe(1);
  });

  it('should have Alert, Lucky, and Tough with no prerequisites', () => {
    const noPrereqFeats = getFeatsWithNoPrerequisites();
    const noPrereqIds = noPrereqFeats.map((f) => f.id);
    expect(noPrereqIds).toContain('alert');
    expect(noPrereqIds).toContain('lucky');
    expect(noPrereqIds).toContain('tough');
  });

  it('should have War Caster with spellcasting prerequisite', () => {
    const warCaster = getFeatById('war-caster');
    expect(warCaster).toBeDefined();
    expect(warCaster!.prerequisite!.spellcasting).toBe(true);
  });

  it('should have Spell Sniper with spellcasting prerequisite', () => {
    const spellSniper = getFeatById('spell-sniper');
    expect(spellSniper).toBeDefined();
    expect(spellSniper!.prerequisite!.spellcasting).toBe(true);
  });

  it('should have Elemental Adept with spellcasting prerequisite', () => {
    const ea = getFeatById('elemental-adept');
    expect(ea).toBeDefined();
    expect(ea!.prerequisite!.spellcasting).toBe(true);
  });

  it('should flag repeatable feats (Elemental Adept)', () => {
    const ea = getFeatById('elemental-adept');
    expect(ea).toBeDefined();
    // Elemental Adept's description or effects should mention it can be taken multiple times
    const hasRepeatableNote = ea!.mechanicalEffects.some(
      (e) => e.toLowerCase().includes('repeatable') || e.toLowerCase().includes('multiple times'),
    );
    expect(hasRepeatableNote).toBe(true);
  });

  it('should have every feat with at least one mechanical effect', () => {
    for (const feat of FEATS) {
      expect(feat.mechanicalEffects.length).toBeGreaterThan(0);
    }
  });

  it('should have every feat with a non-empty description', () => {
    for (const feat of FEATS) {
      expect(feat.description.length).toBeGreaterThan(0);
    }
  });

  it('should have every feat pass TypeScript type checking (satisfies Feat[])', () => {
    // This test verifies at runtime that all feats conform to the Feat interface.
    // The compile-time check is done by `as const satisfies readonly Feat[]` in the source.
    const feats: readonly Feat[] = FEATS;
    expect(feats.length).toBe(42);
    for (const feat of feats) {
      expect(typeof feat.id).toBe('string');
      expect(typeof feat.name).toBe('string');
      expect(typeof feat.description).toBe('string');
      expect(Array.isArray(feat.mechanicalEffects)).toBe(true);
    }
  });

  it('should return undefined for non-existent feat ID', () => {
    expect(getFeatById('fireball-expert')).toBeUndefined();
  });

  it('should have Inspiring Leader with CHA 13 prerequisite', () => {
    const il = getFeatById('inspiring-leader');
    expect(il).toBeDefined();
    expect(il!.prerequisite!.minAbilityScore!.charisma).toBe(13);
  });

  it('should have Ritual Caster with INT 13 prerequisite', () => {
    const rc = getFeatById('ritual-caster');
    expect(rc).toBeDefined();
    expect(rc!.prerequisite!.minAbilityScore!.intelligence).toBe(13);
  });

  it('should have Skulker with DEX 13 prerequisite', () => {
    const skulker = getFeatById('skulker');
    expect(skulker).toBeDefined();
    expect(skulker!.prerequisite!.minAbilityScore!.dexterity).toBe(13);
  });
});
