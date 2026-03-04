/**
 * UI State & Store Types (Story 2.10)
 *
 * Types for application-level state management including the character
 * creation wizard, transient UI state, dice rolling, user preferences,
 * gallery controls, and pagination.
 */

import type { AbilityScores } from './core';
import type { DieType } from './core';
import type { RaceSelection } from './race';
import type { ClassSelection } from './class';
import type { BackgroundSelection } from './background';
import type { AbilityScoreMethod } from './character';

// ---------------------------------------------------------------------------
// Wizard Steps
// ---------------------------------------------------------------------------

/**
 * Named steps in the character creation wizard.
 * Each value corresponds to a screen in the multi-step form.
 */
export type WizardStep =
  | 'race'
  | 'class'
  | 'abilities'
  | 'background'
  | 'equipment'
  | 'spells'
  | 'description'
  | 'review';

export const WIZARD_STEPS: readonly WizardStep[] = [
  'race',
  'class',
  'abilities',
  'background',
  'equipment',
  'spells',
  'description',
  'review',
] as const;

// ---------------------------------------------------------------------------
// Wizard State
// ---------------------------------------------------------------------------

/**
 * Persisted state for the character creation wizard.
 *
 * Uses Zustand with sessionStorage persist middleware so that the wizard
 * state survives page navigation within a session.
 */
export interface WizardState {
  /** Current step index (0-based, indexes into WIZARD_STEPS) */
  currentStep: number;
  /** Set of completed step indices */
  completedSteps: number[];
  /** Character name entered early in the wizard */
  characterName: string;
  /** Wizard mode: guided walks through each step; freeform allows jumping */
  mode: 'guided' | 'freeform';
  /** Whether all required steps are complete */
  isComplete: boolean;

  // -- Step data (optional until that step is completed) --------------------
  raceSelection?: RaceSelection;
  classSelection?: ClassSelection;
  abilityScores?: AbilityScores;
  abilityScoreMethod?: AbilityScoreMethod;
  backgroundSelection?: BackgroundSelection;
  equipmentSelections?: string[];
  spellSelections?: string[];
}

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

export type Theme = 'dark' | 'light';

// ---------------------------------------------------------------------------
// Toast Messages
// ---------------------------------------------------------------------------

/**
 * A notification toast message displayed to the user.
 */
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  /** Auto-dismiss duration in milliseconds. Omit for sticky toasts. */
  duration?: number;
}

// ---------------------------------------------------------------------------
// Modal State
// ---------------------------------------------------------------------------

/**
 * State for controlling modal dialogs across the application.
 */
export interface ModalState {
  isOpen: boolean;
  /** Identifies which modal is active (e.g. 'deleteCharacter', 'exportJson') */
  type: string | null;
  /** Optional payload data for the modal (e.g. character ID to delete) */
  data?: unknown;
}

// ---------------------------------------------------------------------------
// UI State (transient)
// ---------------------------------------------------------------------------

/**
 * Transient application UI state that does not persist across sessions.
 */
export interface UIState {
  /** Currently active modal identifier, or null if no modal is open */
  activeModal: string | null;
  /** Whether the sidebar is expanded */
  sidebarOpen: boolean;
  /** Whether the character sheet is in edit mode */
  editMode: boolean;
  /** Whether the mobile navigation drawer is open */
  mobileNavOpen: boolean;
  /** Whether the dice roller panel is open */
  diceRollerOpen: boolean;
}

// ---------------------------------------------------------------------------
// Dice Roll
// ---------------------------------------------------------------------------

/**
 * A single die group in a dice roll (e.g. "2d6" = { type: 'd6', count: 2 }).
 */
export interface DiceGroup {
  type: DieType;
  count: number;
}

/**
 * A complete dice roll result with full audit trail.
 */
export interface DiceRoll {
  id: string;
  /** The dice groups rolled (e.g. 2d6 + 1d8) */
  dice: DiceGroup[];
  /** Individual die results in roll order */
  results: number[];
  /** Flat modifier added to the total */
  modifier: number;
  /** Final total: sum of results + modifier */
  total: number;
  /** Optional descriptive label (e.g. "Attack Roll", "Fireball Damage") */
  label?: string;
  /** Whether the roll was made with advantage (roll twice, take higher) */
  advantage?: boolean;
  /** Whether the roll was made with disadvantage (roll twice, take lower) */
  disadvantage?: boolean;
  /** When the roll was made */
  timestamp: string;
}

/**
 * Alias for DiceRoll used in dice roller UI contexts.
 * Included for compatibility with the assignment specification.
 */
export type DiceRollResult = DiceRoll;

// ---------------------------------------------------------------------------
// User Preferences
// ---------------------------------------------------------------------------

/**
 * Persistent user settings stored in localStorage.
 */
export interface UserPreferences {
  /** Whether to animate dice rolls */
  diceAnimations: boolean;
  /** Whether to auto-calculate derived stats */
  autoCalculate: boolean;
  /** UI theme preference */
  theme: Theme;
  /** Default ability score method for new characters */
  defaultAbilityScoreMethod: string;
  /** Whether to show informational tooltips */
  showTooltips: boolean;
}

// ---------------------------------------------------------------------------
// Gallery Sorting & Filtering
// ---------------------------------------------------------------------------

/**
 * A sorting option for the character gallery.
 */
export interface SortOption {
  /** The field to sort by */
  field: string;
  /** Sort direction */
  direction: 'asc' | 'desc';
  /** Human-readable label for the sort option */
  label: string;
}

/**
 * A filter option for the character gallery.
 */
export interface FilterOption {
  /** The field to filter on */
  field: string;
  /** The filter value */
  value: string;
  /** Human-readable label for the filter */
  label: string;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/**
 * Pagination state for list views (gallery, session notes, etc.).
 */
export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
