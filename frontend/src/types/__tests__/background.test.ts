/**
 * Type assertion tests for background.ts (Story 2.6)
 *
 * These tests verify that all background and personality types compile
 * correctly under strict TypeScript. They use type-level assertions rather
 * than runtime logic — if the file compiles, the types are valid.
 */

import { describe, it, expect } from 'vitest';
import type {
  Background,
  BackgroundFeature,
  BackgroundSelection,
  CharacterDescription,
  CharacterIdentity,
  CharacterPersonality,
  Feat,
  FeatPrerequisite,
  FeatSelection,
  Ideal,
  PersonalityTrait,
  PersonalityTraits,
  SuggestedCharacteristics,
} from '../background';

// ---------------------------------------------------------------------------
// Helper: assert a value satisfies a type at compile time
// ---------------------------------------------------------------------------
function assertType<T>(_value: T): void {
  // compile-time check only
}

// ---------------------------------------------------------------------------
// Background Feature
// ---------------------------------------------------------------------------
describe('BackgroundFeature', () => {
  it('should define BackgroundFeature with name and description', () => {
    const feature: BackgroundFeature = {
      name: 'Shelter of the Faithful',
      description:
        'As an acolyte, you can expect free healing and care at a temple.',
    };
    assertType<BackgroundFeature>(feature);
    expect(feature.name).toBe('Shelter of the Faithful');
  });
});

// ---------------------------------------------------------------------------
// PersonalityTrait
// ---------------------------------------------------------------------------
describe('PersonalityTrait', () => {
  it('should define PersonalityTrait interface with id and text fields', () => {
    const trait: PersonalityTrait = {
      id: 'acolyte-trait-1',
      text: 'I idolize a particular hero of my faith.',
    };
    assertType<PersonalityTrait>(trait);
    expect(trait.id).toBe('acolyte-trait-1');
    expect(trait.text).toBe('I idolize a particular hero of my faith.');
  });
});

// ---------------------------------------------------------------------------
// Ideal
// ---------------------------------------------------------------------------
describe('Ideal', () => {
  it('should define Ideal with description and alignment tags', () => {
    const ideal: Ideal = {
      description: 'Charity. I always try to help those in need.',
      alignments: ['lawful-good', 'neutral-good'],
    };
    assertType<Ideal>(ideal);
    expect(ideal.alignments).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// SuggestedCharacteristics
// ---------------------------------------------------------------------------
describe('SuggestedCharacteristics', () => {
  it('should define SuggestedCharacteristics with all four trait arrays', () => {
    const chars: SuggestedCharacteristics = {
      personalityTraits: ['I idolize a hero.', 'I am tolerant.'],
      ideals: [
        {
          description: 'Tradition. Ancient traditions must be preserved.',
          alignments: ['lawful-good', 'lawful-neutral', 'lawful-evil'],
        },
      ],
      bonds: ['I would die to recover a relic.'],
      flaws: ['I judge others harshly.'],
    };
    assertType<SuggestedCharacteristics>(chars);
    expect(chars.personalityTraits).toHaveLength(2);
    expect(chars.ideals[0].alignments).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// PersonalityTraits (plain string grouping)
// ---------------------------------------------------------------------------
describe('PersonalityTraits', () => {
  it('should define PersonalityTraits with four string arrays', () => {
    const pts: PersonalityTraits = {
      traits: ['I idolize a hero.'],
      ideals: ['Tradition.'],
      bonds: ['I would die to recover a relic.'],
      flaws: ['I judge others harshly.'],
    };
    assertType<PersonalityTraits>(pts);
    expect(pts.traits).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------
describe('Background', () => {
  it('should define Background interface with skillProficiencies as SkillName array', () => {
    const bg: Background = {
      id: 'acolyte',
      name: 'Acolyte',
      description: 'You have spent your life in the service of a temple.',
      skillProficiencies: ['insight', 'religion'],
      toolProficiencies: [],
      languages: { choose: 2 },
      equipment: [
        'Holy symbol',
        'Prayer book',
        '5 sticks of incense',
        'Vestments',
        '15 gp',
      ],
      feature: {
        name: 'Shelter of the Faithful',
        description: 'Free healing at temples.',
      },
      personalityTraits: [
        { id: 'trait-1', text: 'I idolize a particular hero.' },
      ],
      ideals: [{ id: 'ideal-1', text: 'Tradition.' }],
      bonds: [{ id: 'bond-1', text: 'I would die to recover a relic.' }],
      flaws: [{ id: 'flaw-1', text: 'I judge others harshly.' }],
    };
    assertType<Background>(bg);
    expect(bg.skillProficiencies).toEqual(['insight', 'religion']);
  });

  it('should define Background.languages supporting both fixed string[] and choice-based { choose: number } patterns', () => {
    // Choice-based languages
    const bgChoice: Background = {
      id: 'sage',
      name: 'Sage',
      description: 'You spent years learning the lore of the multiverse.',
      skillProficiencies: ['arcana', 'history'],
      toolProficiencies: [],
      languages: { choose: 2 },
      equipment: [],
      feature: { name: 'Researcher', description: 'Know where to find info.' },
      personalityTraits: [],
      ideals: [],
      bonds: [],
      flaws: [],
    };

    // Fixed languages
    const bgFixed: Background = {
      id: 'hermit',
      name: 'Hermit',
      description: 'You lived in seclusion.',
      skillProficiencies: ['medicine', 'religion'],
      toolProficiencies: ['Herbalism kit'],
      languages: ['Elvish'],
      equipment: [],
      feature: { name: 'Discovery', description: 'Found a unique truth.' },
      personalityTraits: [],
      ideals: [],
      bonds: [],
      flaws: [],
    };

    assertType<Background>(bgChoice);
    assertType<Background>(bgFixed);
    expect(bgChoice.languages).toEqual({ choose: 2 });
    expect(bgFixed.languages).toEqual(['Elvish']);
  });

  it('should define Background.personalityTraits as PersonalityTrait array (d8 table)', () => {
    const bg: Background = {
      id: 'acolyte',
      name: 'Acolyte',
      description: 'Temple service.',
      skillProficiencies: ['insight', 'religion'],
      toolProficiencies: [],
      languages: { choose: 2 },
      equipment: [],
      feature: { name: 'Shelter of the Faithful', description: 'Healing.' },
      personalityTraits: [
        { id: '1', text: 'Trait 1' },
        { id: '2', text: 'Trait 2' },
        { id: '3', text: 'Trait 3' },
        { id: '4', text: 'Trait 4' },
        { id: '5', text: 'Trait 5' },
        { id: '6', text: 'Trait 6' },
        { id: '7', text: 'Trait 7' },
        { id: '8', text: 'Trait 8' },
      ],
      ideals: [],
      bonds: [],
      flaws: [],
    };
    assertType<Background>(bg);
    expect(bg.personalityTraits).toHaveLength(8);
  });

  it('should define Background.ideals as PersonalityTrait array (d6 table)', () => {
    const bg: Background = {
      id: 'acolyte',
      name: 'Acolyte',
      description: 'Temple service.',
      skillProficiencies: ['insight', 'religion'],
      toolProficiencies: [],
      languages: { choose: 2 },
      equipment: [],
      feature: { name: 'Shelter', description: 'Healing.' },
      personalityTraits: [],
      ideals: [
        { id: '1', text: 'Tradition (Lawful)' },
        { id: '2', text: 'Charity (Good)' },
        { id: '3', text: 'Change (Chaotic)' },
        { id: '4', text: 'Power (Evil)' },
        { id: '5', text: 'Faith (Any)' },
        { id: '6', text: 'Aspiration (Any)' },
      ],
      bonds: [],
      flaws: [],
    };
    assertType<Background>(bg);
    expect(bg.ideals).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// CharacterIdentity
// ---------------------------------------------------------------------------
describe('CharacterIdentity', () => {
  it('should define CharacterIdentity with required name and optional physical fields', () => {
    // Minimal
    const minimal: CharacterIdentity = { name: 'Theron' };
    assertType<CharacterIdentity>(minimal);
    expect(minimal.name).toBe('Theron');

    // Full
    const full: CharacterIdentity = {
      name: 'Theron',
      age: '250 years',
      height: "6'2\"",
      weight: '180 lbs',
      eyes: 'Green',
      skin: 'Fair',
      hair: 'Silver',
      appearance: 'Tall and gaunt with sharp features.',
    };
    assertType<CharacterIdentity>(full);
    expect(full.age).toBe('250 years');
  });
});

// ---------------------------------------------------------------------------
// CharacterDescription
// ---------------------------------------------------------------------------
describe('CharacterDescription', () => {
  it('should define CharacterDescription with all physical description fields as strings', () => {
    const desc: CharacterDescription = {
      name: 'Theron',
      age: '250 years',
      height: "6'2\"",
      weight: '180 lbs',
      eyes: 'Green',
      skin: 'Fair',
      hair: 'Silver',
      appearance: 'Tall and gaunt.',
      backstory: 'Grew up in a secluded monastery.',
      alliesAndOrgs: 'The Order of the Gauntlet',
      treasure: 'A mysterious amulet.',
    };
    assertType<CharacterDescription>(desc);
    expect(desc.backstory).toBe('Grew up in a secluded monastery.');
  });
});

// ---------------------------------------------------------------------------
// CharacterPersonality
// ---------------------------------------------------------------------------
describe('CharacterPersonality', () => {
  it('should define CharacterPersonality with a tuple of two traits', () => {
    const personality: CharacterPersonality = {
      personalityTraits: [
        'I idolize a particular hero.',
        'I am tolerant of other faiths.',
      ],
      ideal: 'Tradition. The ancient traditions must be preserved.',
      bond: 'I would die to recover an ancient relic.',
      flaw: 'I judge others harshly.',
    };
    assertType<CharacterPersonality>(personality);
    expect(personality.personalityTraits).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// BackgroundSelection
// ---------------------------------------------------------------------------
describe('BackgroundSelection', () => {
  it('should define BackgroundSelection with optional chosenSkills, chosenLanguages, and chosenTools', () => {
    // Minimal selection
    const minimal: BackgroundSelection = {
      backgroundId: 'acolyte',
      characterIdentity: { name: 'Theron' },
      characterPersonality: {
        personalityTraits: ['Trait A', 'Trait B'],
        ideal: 'Tradition.',
        bond: 'Recover a relic.',
        flaw: 'Judge harshly.',
      },
    };
    assertType<BackgroundSelection>(minimal);
    expect(minimal.backgroundId).toBe('acolyte');

    // Full selection with replacements
    const full: BackgroundSelection = {
      backgroundId: 'acolyte',
      chosenSkillProficiencies: ['perception', 'investigation'],
      chosenToolProficiencies: ['Herbalism kit'],
      chosenLanguages: ['Elvish', 'Dwarvish'],
      characterIdentity: {
        name: 'Theron',
        age: '35',
        height: "5'10\"",
      },
      characterPersonality: {
        personalityTraits: ['Trait A', 'Trait B'],
        ideal: 'Tradition.',
        bond: 'Recover a relic.',
        flaw: 'Judge harshly.',
      },
    };
    assertType<BackgroundSelection>(full);
    expect(full.chosenSkillProficiencies).toEqual([
      'perception',
      'investigation',
    ]);
  });
});

// ---------------------------------------------------------------------------
// Feat & FeatPrerequisite
// ---------------------------------------------------------------------------
describe('Feat', () => {
  it('should define Feat with optional prerequisite and abilityScoreIncrease', () => {
    const feat: Feat = {
      id: 'alert',
      name: 'Alert',
      description: 'Always on the lookout for danger.',
      mechanicalEffects: [
        '+5 bonus to initiative',
        "Can't be surprised while conscious",
      ],
    };
    assertType<Feat>(feat);
    expect(feat.mechanicalEffects).toHaveLength(2);
  });

  it('should define Feat with prerequisite requirements', () => {
    const feat: Feat = {
      id: 'heavily-armored',
      name: 'Heavily Armored',
      description: 'You have trained to master the use of heavy armor.',
      prerequisite: {
        armorProficiency: true,
      },
      abilityScoreIncrease: { strength: 1 },
      mechanicalEffects: ['Gain proficiency with heavy armor'],
    };
    assertType<Feat>(feat);
    expect(feat.prerequisite?.armorProficiency).toBe(true);
  });
});

describe('FeatPrerequisite', () => {
  it('should define FeatPrerequisite with all optional fields', () => {
    const prereq: FeatPrerequisite = {
      minAbilityScore: { strength: 13, dexterity: 13 },
      race: 'elf',
      armorProficiency: true,
      spellcasting: true,
    };
    assertType<FeatPrerequisite>(prereq);
    expect(prereq.minAbilityScore?.strength).toBe(13);
  });
});

describe('FeatSelection', () => {
  it('should define FeatSelection with featId and optional chosenAbility', () => {
    const selection: FeatSelection = {
      featId: 'heavily-armored',
      chosenAbility: 'strength',
    };
    assertType<FeatSelection>(selection);
    expect(selection.chosenAbility).toBe('strength');
  });
});
