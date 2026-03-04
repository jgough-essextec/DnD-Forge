// =============================================================================
// Gallery Utilities (Epic 21)
//
// Client-side utility functions for the Character Gallery feature:
// - Relative time formatting
// - Character filtering and sorting
// - Duplicate name generation
// =============================================================================

import type { CharacterSummary } from '@/types/character';

// ---------------------------------------------------------------------------
// GalleryCharacter — extended summary with gallery-specific fields
// ---------------------------------------------------------------------------

/**
 * Extended character summary with fields needed for gallery display
 * that go beyond the base CharacterSummary type.
 */
export interface GalleryCharacter extends CharacterSummary {
  /** Passive perception score (10 + Wisdom modifier + proficiency if applicable) */
  passivePerception?: number;
  /** ISO 8601 timestamp of last update */
  updatedAt?: string;
  /** ISO 8601 timestamp of creation */
  createdAt?: string;
  /** Campaign ID if character is linked to a campaign */
  campaignId?: string | null;
  /** Campaign name for badge display */
  campaignName?: string | null;
  /** Whether the character is soft-deleted / archived */
  isArchived?: boolean;
}

// ---------------------------------------------------------------------------
// Sort options
// ---------------------------------------------------------------------------

export type SortOption =
  | 'lastEdited'
  | 'nameAZ'
  | 'nameZA'
  | 'levelHighLow'
  | 'levelLowHigh'
  | 'createdNewest'
  | 'createdOldest';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'lastEdited', label: 'Last Edited' },
  { value: 'nameAZ', label: 'Name A-Z' },
  { value: 'nameZA', label: 'Name Z-A' },
  { value: 'levelHighLow', label: 'Level High-Low' },
  { value: 'levelLowHigh', label: 'Level Low-High' },
  { value: 'createdNewest', label: 'Date Created Newest' },
  { value: 'createdOldest', label: 'Date Created Oldest' },
];

// ---------------------------------------------------------------------------
// Level range definitions
// ---------------------------------------------------------------------------

export type LevelRange = '1-4' | '5-10' | '11-16' | '17-20';

export const LEVEL_RANGES: { value: LevelRange; label: string }[] = [
  { value: '1-4', label: 'Tier 1 (1-4)' },
  { value: '5-10', label: 'Tier 2 (5-10)' },
  { value: '11-16', label: 'Tier 3 (11-16)' },
  { value: '17-20', label: 'Tier 4 (17-20)' },
];

const LEVEL_RANGE_MAP: Record<LevelRange, [number, number]> = {
  '1-4': [1, 4],
  '5-10': [5, 10],
  '11-16': [11, 16],
  '17-20': [17, 20],
};

// ---------------------------------------------------------------------------
// Filter interface
// ---------------------------------------------------------------------------

export interface GalleryFilters {
  search: string;
  classes: string[];
  races: string[];
  levelRanges: LevelRange[];
  showArchived: boolean;
}

export const DEFAULT_FILTERS: GalleryFilters = {
  search: '',
  classes: [],
  races: [],
  levelRanges: [],
  showArchived: false,
};

// ---------------------------------------------------------------------------
// View mode
// ---------------------------------------------------------------------------

export type ViewMode = 'grid' | 'list';

// ---------------------------------------------------------------------------
// formatRelativeTime
// ---------------------------------------------------------------------------

/**
 * Format an ISO 8601 date string into a human-readable relative time string.
 *
 * Examples: "Just now", "2 minutes ago", "1 hour ago", "Yesterday", "3 days ago",
 * "2 weeks ago", "1 month ago", "6 months ago"
 *
 * @param dateString - ISO 8601 timestamp
 * @param now - Optional "now" timestamp for testing determinism
 */
export function formatRelativeTime(dateString: string, now?: Date): string {
  const date = new Date(dateString);
  const reference = now ?? new Date();
  const diffMs = reference.getTime() - date.getTime();

  if (diffMs < 0) {
    return 'Just now';
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }

  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  if (diffWeeks < 4) {
    return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
  }

  if (diffMonths < 12) {
    return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
}

// ---------------------------------------------------------------------------
// filterCharacters
// ---------------------------------------------------------------------------

/**
 * Filter a list of gallery characters based on the given filter criteria.
 * All filters are applied as AND conditions. Multi-select filters (classes,
 * races, levelRanges) use OR within the group.
 */
export function filterCharacters(
  characters: GalleryCharacter[],
  filters: GalleryFilters,
): GalleryCharacter[] {
  return characters.filter((char) => {
    // Archived filter
    if (!filters.showArchived && char.isArchived) {
      return false;
    }

    // Search filter (case-insensitive substring on name)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!char.name.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Class filter (multi-select OR)
    if (filters.classes.length > 0) {
      const charClassLower = char.class.toLowerCase();
      if (!filters.classes.some((c) => charClassLower.includes(c.toLowerCase()))) {
        return false;
      }
    }

    // Race filter (multi-select OR)
    if (filters.races.length > 0) {
      const charRaceLower = char.race.toLowerCase();
      if (!filters.races.some((r) => charRaceLower.includes(r.toLowerCase()))) {
        return false;
      }
    }

    // Level range filter (multi-select OR)
    if (filters.levelRanges.length > 0) {
      const inRange = filters.levelRanges.some((range) => {
        const [min, max] = LEVEL_RANGE_MAP[range];
        return char.level >= min && char.level <= max;
      });
      if (!inRange) {
        return false;
      }
    }

    return true;
  });
}

// ---------------------------------------------------------------------------
// sortCharacters
// ---------------------------------------------------------------------------

/**
 * Sort a list of gallery characters by the given sort option.
 * Returns a new array (does not mutate the input).
 */
export function sortCharacters(
  characters: GalleryCharacter[],
  sortOption: SortOption,
): GalleryCharacter[] {
  const sorted = [...characters];

  switch (sortOption) {
    case 'lastEdited':
      sorted.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA; // newest first
      });
      break;
    case 'nameAZ':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'nameZA':
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'levelHighLow':
      sorted.sort((a, b) => b.level - a.level);
      break;
    case 'levelLowHigh':
      sorted.sort((a, b) => a.level - b.level);
      break;
    case 'createdNewest':
      sorted.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      break;
    case 'createdOldest':
      sorted.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
      break;
  }

  return sorted;
}

// ---------------------------------------------------------------------------
// duplicateCharacterName
// ---------------------------------------------------------------------------

/**
 * Generate a duplicate character name by appending "(Copy)" or incrementing
 * the copy counter.
 *
 * "Gandalf" -> "Gandalf (Copy)"
 * "Gandalf (Copy)" -> "Gandalf (Copy 2)"
 * "Gandalf (Copy 2)" -> "Gandalf (Copy 3)"
 */
export function duplicateCharacterName(name: string): string {
  // Check if name already has (Copy N)
  const copyNMatch = name.match(/^(.+)\s\(Copy\s(\d+)\)$/);
  if (copyNMatch) {
    const baseName = copyNMatch[1];
    const num = parseInt(copyNMatch[2], 10);
    return `${baseName} (Copy ${num + 1})`;
  }

  // Check if name already has (Copy)
  const copyMatch = name.match(/^(.+)\s\(Copy\)$/);
  if (copyMatch) {
    const baseName = copyMatch[1];
    return `${baseName} (Copy 2)`;
  }

  // No copy suffix yet
  return `${name} (Copy)`;
}

// ---------------------------------------------------------------------------
// Helper: extract unique values for filter dropdowns
// ---------------------------------------------------------------------------

/**
 * Extract unique class names with counts from a character list.
 */
export function getClassCounts(characters: GalleryCharacter[]): { value: string; label: string }[] {
  const counts = new Map<string, number>();
  for (const char of characters) {
    const cls = char.class;
    counts.set(cls, (counts.get(cls) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cls, count]) => ({ value: cls, label: `${cls} (${count})` }));
}

/**
 * Extract unique race names with counts from a character list.
 */
export function getRaceCounts(characters: GalleryCharacter[]): { value: string; label: string }[] {
  const counts = new Map<string, number>();
  for (const char of characters) {
    const race = char.race;
    counts.set(race, (counts.get(race) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([race, count]) => ({ value: race, label: `${race} (${count})` }));
}
