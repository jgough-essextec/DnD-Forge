/**
 * Tests for SRD Background Data (Story 3.5)
 */
import { describe, it, expect } from 'vitest';
import { BACKGROUNDS, getBackgroundById } from '@/data/backgrounds';

describe('BACKGROUNDS', () => {
  it('should export backgrounds array with at least 13 SRD backgrounds', () => {
    expect(BACKGROUNDS.length).toBeGreaterThanOrEqual(13);
  });

  it('should have no duplicate background IDs', () => {
    const ids = BACKGROUNDS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have all expected SRD backgrounds', () => {
    const expectedIds = [
      'acolyte', 'charlatan', 'criminal', 'entertainer', 'folk-hero',
      'guild-artisan', 'hermit', 'noble', 'outlander', 'sage',
      'sailor', 'soldier', 'urchin',
    ];
    const actualIds = BACKGROUNDS.map((b) => b.id);
    for (const id of expectedIds) {
      expect(actualIds).toContain(id);
    }
  });

  it('should have Acolyte with skills Insight and Religion, and 2 language choices', () => {
    const acolyte = getBackgroundById('acolyte');
    expect(acolyte).toBeDefined();
    expect(acolyte!.skillProficiencies).toContain('insight');
    expect(acolyte!.skillProficiencies).toContain('religion');
    expect(acolyte!.languages).toEqual({ choose: 2 });
  });

  it('should have each background with 8 personality traits, 6 ideals, 6 bonds, 6 flaws', () => {
    for (const bg of BACKGROUNDS) {
      expect(bg.personalityTraits).toHaveLength(8);
      expect(bg.ideals).toHaveLength(6);
      expect(bg.bonds).toHaveLength(6);
      expect(bg.flaws).toHaveLength(6);
    }
  });

  it('should have Acolyte ideals tagged with alignment in suggestedCharacteristics', () => {
    const acolyte = getBackgroundById('acolyte');
    expect(acolyte).toBeDefined();
    expect(acolyte!.suggestedCharacteristics).toBeDefined();
    const ideals = acolyte!.suggestedCharacteristics!.ideals;
    expect(ideals.length).toBe(6);
    for (const ideal of ideals) {
      expect(ideal.alignments.length).toBeGreaterThan(0);
      expect(ideal.description.length).toBeGreaterThan(0);
    }
  });

  it('should have Criminal/Spy modeled as single background with variant note', () => {
    const criminal = getBackgroundById('criminal');
    expect(criminal).toBeDefined();
    expect(criminal!.name).toBe('Criminal');
    expect(criminal!.description).toContain('Spy');
  });

  it('should have every background with a feature name and description', () => {
    for (const bg of BACKGROUNDS) {
      expect(bg.feature.name.length).toBeGreaterThan(0);
      expect(bg.feature.description.length).toBeGreaterThan(0);
    }
  });

  it('should have every background with exactly 2 skill proficiencies', () => {
    for (const bg of BACKGROUNDS) {
      expect(bg.skillProficiencies).toHaveLength(2);
    }
  });

  it('should have backgrounds with correct tool proficiency choices (choose pattern)', () => {
    const folkHero = getBackgroundById('folk-hero');
    expect(folkHero).toBeDefined();
    expect(folkHero!.toolProficiencies.length).toBeGreaterThan(0);
    // Folk Hero has one type of artisan's tools and vehicles (land)
    expect(folkHero!.toolProficiencies).toContain("One type of artisan's tools");
    expect(folkHero!.toolProficiencies).toContain('Vehicles (land)');
  });

  it('should have every personality trait with a non-empty id and text', () => {
    for (const bg of BACKGROUNDS) {
      for (const trait of bg.personalityTraits) {
        expect(trait.id.length).toBeGreaterThan(0);
        expect(trait.text.length).toBeGreaterThan(0);
      }
      for (const ideal of bg.ideals) {
        expect(ideal.id.length).toBeGreaterThan(0);
        expect(ideal.text.length).toBeGreaterThan(0);
      }
      for (const bond of bg.bonds) {
        expect(bond.id.length).toBeGreaterThan(0);
        expect(bond.text.length).toBeGreaterThan(0);
      }
      for (const flaw of bg.flaws) {
        expect(flaw.id.length).toBeGreaterThan(0);
        expect(flaw.text.length).toBeGreaterThan(0);
      }
    }
  });

  it('should have every background with at least one equipment item', () => {
    for (const bg of BACKGROUNDS) {
      expect(bg.equipment.length).toBeGreaterThan(0);
    }
  });

  it('should have Noble with 25 gp in equipment', () => {
    const noble = getBackgroundById('noble');
    expect(noble).toBeDefined();
    expect(noble!.equipment).toContain('25 gp');
  });

  it('should have Hermit with Herbalism kit tool proficiency', () => {
    const hermit = getBackgroundById('hermit');
    expect(hermit).toBeDefined();
    expect(hermit!.toolProficiencies).toContain('Herbalism kit');
  });

  it('should have Urchin with Disguise kit and Thieves\' tools', () => {
    const urchin = getBackgroundById('urchin');
    expect(urchin).toBeDefined();
    expect(urchin!.toolProficiencies).toContain('Disguise kit');
    expect(urchin!.toolProficiencies).toContain("Thieves' tools");
  });

  it('should return undefined for non-existent background ID', () => {
    expect(getBackgroundById('pirate')).toBeUndefined();
  });

  // Document the skill overlap replacement rule
  it('should document skill overlap rule: backgrounds that share skills with classes', () => {
    // The skill overlap replacement rule is documented in the file header comment.
    // This test validates that backgrounds have well-defined skill proficiencies
    // that can be checked against class skill lists at runtime.
    const validSkills = [
      'acrobatics', 'animal-handling', 'arcana', 'athletics', 'deception',
      'history', 'insight', 'intimidation', 'investigation', 'medicine',
      'nature', 'perception', 'performance', 'persuasion', 'religion',
      'sleight-of-hand', 'stealth', 'survival',
    ];
    for (const bg of BACKGROUNDS) {
      for (const skill of bg.skillProficiencies) {
        expect(validSkills).toContain(skill);
      }
    }
  });
});
