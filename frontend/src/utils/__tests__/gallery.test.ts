// =============================================================================
// Gallery utility function tests (Epic 21)
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  formatRelativeTime,
  filterCharacters,
  sortCharacters,
  duplicateCharacterName,
  getClassCounts,
  getRaceCounts,
} from '@/utils/gallery';
import type { GalleryCharacter, GalleryFilters } from '@/utils/gallery';

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

function makeChar(overrides: Partial<GalleryCharacter> = {}): GalleryCharacter {
  return {
    id: 'char-1',
    name: 'Thorn',
    race: 'Dwarf',
    class: 'Fighter',
    level: 5,
    hp: { current: 44, max: 52 },
    ac: 18,
    updatedAt: '2024-06-15T08:30:00Z',
    createdAt: '2024-06-01T12:00:00Z',
    isArchived: false,
    ...overrides,
  };
}

const now = new Date('2024-06-17T12:00:00Z');

// ---------------------------------------------------------------------------
// formatRelativeTime
// ---------------------------------------------------------------------------

describe('formatRelativeTime', () => {
  it('returns "Just now" for timestamps less than 60 seconds ago', () => {
    const date = new Date(now.getTime() - 30 * 1000).toISOString();
    expect(formatRelativeTime(date, now)).toBe('Just now');
  });

  it('returns "Just now" for future timestamps', () => {
    const date = new Date(now.getTime() + 60000).toISOString();
    expect(formatRelativeTime(date, now)).toBe('Just now');
  });

  it('returns "1 minute ago" for 60-119 seconds', () => {
    const date = new Date(now.getTime() - 90 * 1000).toISOString();
    expect(formatRelativeTime(date, now)).toBe('1 minute ago');
  });

  it('returns "N minutes ago" for 2-59 minutes', () => {
    const date = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date, now)).toBe('5 minutes ago');
  });

  it('returns "2 minutes ago" for exactly 2 minutes', () => {
    const date = new Date(now.getTime() - 2 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date, now)).toBe('2 minutes ago');
  });

  it('returns "1 hour ago" for 60-119 minutes', () => {
    const date = new Date(now.getTime() - 90 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date, now)).toBe('1 hour ago');
  });

  it('returns "N hours ago" for 2-23 hours', () => {
    const date = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date, now)).toBe('3 hours ago');
  });

  it('returns "Yesterday" for 24-47 hours', () => {
    const date = new Date(now.getTime() - 30 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date, now)).toBe('Yesterday');
  });

  it('returns "N days ago" for 2-6 days', () => {
    const date = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date, now)).toBe('3 days ago');
  });

  it('returns "1 week ago" for 7-13 days', () => {
    const date = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date, now)).toBe('1 week ago');
  });

  it('returns "N weeks ago" for 14-27 days', () => {
    const date = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date, now)).toBe('2 weeks ago');
  });

  it('returns "1 month ago" for 30-59 days', () => {
    const date = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date, now)).toBe('1 month ago');
  });

  it('returns "N months ago" for 60-364 days', () => {
    const date = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date, now)).toBe('6 months ago');
  });

  it('returns "1 year ago" for 365-729 days', () => {
    const date = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date, now)).toBe('1 year ago');
  });

  it('returns "N years ago" for 730+ days', () => {
    const date = new Date(now.getTime() - 800 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date, now)).toBe('2 years ago');
  });
});

// ---------------------------------------------------------------------------
// filterCharacters
// ---------------------------------------------------------------------------

describe('filterCharacters', () => {
  const characters: GalleryCharacter[] = [
    makeChar({ id: '1', name: 'Thorn Ironforge', race: 'Dwarf', class: 'Fighter', level: 5, isArchived: false }),
    makeChar({ id: '2', name: 'Elara Nightwhisper', race: 'Elf', class: 'Wizard', level: 3, isArchived: false }),
    makeChar({ id: '3', name: 'Grog the Mighty', race: 'Half-Orc', class: 'Barbarian', level: 12, isArchived: false }),
    makeChar({ id: '4', name: 'Shadow', race: 'Halfling', class: 'Rogue', level: 1, isArchived: true }),
    makeChar({ id: '5', name: 'Celestia', race: 'Elf', class: 'Cleric', level: 18, isArchived: false }),
  ];

  const defaultFilters: GalleryFilters = {
    search: '',
    classes: [],
    races: [],
    levelRanges: [],
    showArchived: false,
  };

  it('returns all non-archived characters with default filters', () => {
    const result = filterCharacters(characters, defaultFilters);
    expect(result).toHaveLength(4);
    expect(result.find((c) => c.id === '4')).toBeUndefined();
  });

  it('includes archived characters when showArchived is true', () => {
    const result = filterCharacters(characters, { ...defaultFilters, showArchived: true });
    expect(result).toHaveLength(5);
  });

  it('filters by search term (case-insensitive)', () => {
    const result = filterCharacters(characters, { ...defaultFilters, search: 'thorn' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Thorn Ironforge');
  });

  it('filters by partial name match', () => {
    const result = filterCharacters(characters, { ...defaultFilters, search: 'ela' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Elara Nightwhisper');
  });

  it('returns empty when search matches nothing', () => {
    const result = filterCharacters(characters, { ...defaultFilters, search: 'zzzzz' });
    expect(result).toHaveLength(0);
  });

  it('filters by single class', () => {
    const result = filterCharacters(characters, { ...defaultFilters, classes: ['Fighter'] });
    expect(result).toHaveLength(1);
    expect(result[0].class).toBe('Fighter');
  });

  it('filters by multiple classes (OR)', () => {
    const result = filterCharacters(characters, { ...defaultFilters, classes: ['Fighter', 'Wizard'] });
    expect(result).toHaveLength(2);
  });

  it('filters by race', () => {
    const result = filterCharacters(characters, { ...defaultFilters, races: ['Elf'] });
    expect(result).toHaveLength(2);
  });

  it('filters by multiple races (OR)', () => {
    const result = filterCharacters(characters, { ...defaultFilters, races: ['Elf', 'Dwarf'] });
    expect(result).toHaveLength(3);
  });

  it('filters by level range (tier 1: 1-4)', () => {
    const result = filterCharacters(characters, { ...defaultFilters, levelRanges: ['1-4'] });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Elara Nightwhisper');
  });

  it('filters by level range (tier 2: 5-10)', () => {
    const result = filterCharacters(characters, { ...defaultFilters, levelRanges: ['5-10'] });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Thorn Ironforge');
  });

  it('filters by level range (tier 3: 11-16)', () => {
    const result = filterCharacters(characters, { ...defaultFilters, levelRanges: ['11-16'] });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Grog the Mighty');
  });

  it('filters by level range (tier 4: 17-20)', () => {
    const result = filterCharacters(characters, { ...defaultFilters, levelRanges: ['17-20'] });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Celestia');
  });

  it('filters by multiple level ranges (OR)', () => {
    const result = filterCharacters(characters, { ...defaultFilters, levelRanges: ['1-4', '5-10'] });
    expect(result).toHaveLength(2);
  });

  it('combines search + class filter (AND)', () => {
    const result = filterCharacters(characters, { ...defaultFilters, search: 'e', classes: ['Wizard'] });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Elara Nightwhisper');
  });

  it('combines race + level range (AND)', () => {
    const result = filterCharacters(characters, { ...defaultFilters, races: ['Elf'], levelRanges: ['17-20'] });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Celestia');
  });

  it('class filter is case-insensitive', () => {
    const result = filterCharacters(characters, { ...defaultFilters, classes: ['fighter'] });
    expect(result).toHaveLength(1);
  });

  it('race filter is case-insensitive', () => {
    const result = filterCharacters(characters, { ...defaultFilters, races: ['elf'] });
    expect(result).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// sortCharacters
// ---------------------------------------------------------------------------

describe('sortCharacters', () => {
  const characters: GalleryCharacter[] = [
    makeChar({ id: '1', name: 'Zara', level: 3, updatedAt: '2024-06-10T00:00:00Z', createdAt: '2024-05-01T00:00:00Z' }),
    makeChar({ id: '2', name: 'Abel', level: 10, updatedAt: '2024-06-15T00:00:00Z', createdAt: '2024-04-01T00:00:00Z' }),
    makeChar({ id: '3', name: 'Middle', level: 7, updatedAt: '2024-06-12T00:00:00Z', createdAt: '2024-06-01T00:00:00Z' }),
  ];

  it('sorts by lastEdited (newest first)', () => {
    const result = sortCharacters(characters, 'lastEdited');
    expect(result.map((c) => c.name)).toEqual(['Abel', 'Middle', 'Zara']);
  });

  it('sorts by name A-Z', () => {
    const result = sortCharacters(characters, 'nameAZ');
    expect(result.map((c) => c.name)).toEqual(['Abel', 'Middle', 'Zara']);
  });

  it('sorts by name Z-A', () => {
    const result = sortCharacters(characters, 'nameZA');
    expect(result.map((c) => c.name)).toEqual(['Zara', 'Middle', 'Abel']);
  });

  it('sorts by level high to low', () => {
    const result = sortCharacters(characters, 'levelHighLow');
    expect(result.map((c) => c.level)).toEqual([10, 7, 3]);
  });

  it('sorts by level low to high', () => {
    const result = sortCharacters(characters, 'levelLowHigh');
    expect(result.map((c) => c.level)).toEqual([3, 7, 10]);
  });

  it('sorts by created date newest first', () => {
    const result = sortCharacters(characters, 'createdNewest');
    expect(result.map((c) => c.name)).toEqual(['Middle', 'Zara', 'Abel']);
  });

  it('sorts by created date oldest first', () => {
    const result = sortCharacters(characters, 'createdOldest');
    expect(result.map((c) => c.name)).toEqual(['Abel', 'Zara', 'Middle']);
  });

  it('does not mutate the original array', () => {
    const original = [...characters];
    sortCharacters(characters, 'nameAZ');
    expect(characters.map((c) => c.name)).toEqual(original.map((c) => c.name));
  });

  it('handles characters without updatedAt for lastEdited sort', () => {
    const chars: GalleryCharacter[] = [
      makeChar({ id: '1', name: 'Has Date', updatedAt: '2024-06-15T00:00:00Z' }),
      makeChar({ id: '2', name: 'No Date', updatedAt: undefined }),
    ];
    const result = sortCharacters(chars, 'lastEdited');
    expect(result[0].name).toBe('Has Date');
  });

  it('handles empty array', () => {
    const result = sortCharacters([], 'nameAZ');
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// duplicateCharacterName
// ---------------------------------------------------------------------------

describe('duplicateCharacterName', () => {
  it('appends (Copy) to a simple name', () => {
    expect(duplicateCharacterName('Gandalf')).toBe('Gandalf (Copy)');
  });

  it('converts (Copy) to (Copy 2)', () => {
    expect(duplicateCharacterName('Gandalf (Copy)')).toBe('Gandalf (Copy 2)');
  });

  it('increments (Copy 2) to (Copy 3)', () => {
    expect(duplicateCharacterName('Gandalf (Copy 2)')).toBe('Gandalf (Copy 3)');
  });

  it('increments (Copy 10) to (Copy 11)', () => {
    expect(duplicateCharacterName('Gandalf (Copy 10)')).toBe('Gandalf (Copy 11)');
  });

  it('handles names with special characters', () => {
    expect(duplicateCharacterName("O'Brien the Brave")).toBe("O'Brien the Brave (Copy)");
  });

  it('handles empty string', () => {
    expect(duplicateCharacterName('')).toBe(' (Copy)');
  });

  it('does not treat random parentheses as copy suffix', () => {
    expect(duplicateCharacterName('Thorn (the strong)')).toBe('Thorn (the strong) (Copy)');
  });

  it('handles name that is just "(Copy)"', () => {
    expect(duplicateCharacterName('(Copy)')).toBe('(Copy) (Copy)');
  });
});

// ---------------------------------------------------------------------------
// getClassCounts
// ---------------------------------------------------------------------------

describe('getClassCounts', () => {
  it('returns class names with counts sorted alphabetically', () => {
    const characters: GalleryCharacter[] = [
      makeChar({ id: '1', class: 'Fighter' }),
      makeChar({ id: '2', class: 'Wizard' }),
      makeChar({ id: '3', class: 'Fighter' }),
    ];
    const result = getClassCounts(characters);
    expect(result).toEqual([
      { value: 'Fighter', label: 'Fighter (2)' },
      { value: 'Wizard', label: 'Wizard (1)' },
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(getClassCounts([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getRaceCounts
// ---------------------------------------------------------------------------

describe('getRaceCounts', () => {
  it('returns race names with counts sorted alphabetically', () => {
    const characters: GalleryCharacter[] = [
      makeChar({ id: '1', race: 'Elf' }),
      makeChar({ id: '2', race: 'Dwarf' }),
      makeChar({ id: '3', race: 'Elf' }),
      makeChar({ id: '4', race: 'Elf' }),
    ];
    const result = getRaceCounts(characters);
    expect(result).toEqual([
      { value: 'Dwarf', label: 'Dwarf (1)' },
      { value: 'Elf', label: 'Elf (3)' },
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(getRaceCounts([])).toEqual([]);
  });
});
