/**
 * Type assertion tests for ui.ts (Story 2.10)
 *
 * These tests verify that all UI state and store types compile correctly
 * under strict TypeScript. They use type-level assertions and minimal
 * runtime checks.
 */

import { describe, it, expect } from 'vitest';
import type {
  DiceGroup,
  DiceRoll,
  DiceRollResult,
  FilterOption,
  ModalState,
  Pagination,
  SortOption,
  Theme,
  ToastMessage,
  UIState,
  UserPreferences,
  WizardState,
  WizardStep,
} from '../ui';
import { WIZARD_STEPS } from '../ui';

// Barrel export verification imports
import type {
  Character,
  Spell,
  Race,
} from '../index';

// ---------------------------------------------------------------------------
// Helper: assert a value satisfies a type at compile time
// ---------------------------------------------------------------------------
function assertType<T>(_value: T): void {
  // compile-time check only
}

// ---------------------------------------------------------------------------
// WizardStep
// ---------------------------------------------------------------------------
describe('WizardStep', () => {
  it('should define WizardStep with all wizard screen names', () => {
    const steps: WizardStep[] = [
      'race',
      'class',
      'abilities',
      'background',
      'equipment',
      'spells',
      'description',
      'review',
    ];
    steps.forEach((s) => assertType<WizardStep>(s));
    expect(steps).toHaveLength(8);
  });

  it('should export WIZARD_STEPS const array', () => {
    expect(WIZARD_STEPS).toHaveLength(8);
    expect(WIZARD_STEPS[0]).toBe('race');
    expect(WIZARD_STEPS[WIZARD_STEPS.length - 1]).toBe('review');
  });
});

// ---------------------------------------------------------------------------
// WizardState
// ---------------------------------------------------------------------------
describe('WizardState', () => {
  it('should define WizardState with currentStep and isComplete fields', () => {
    const state: WizardState = {
      currentStep: 0,
      completedSteps: [],
      characterName: '',
      mode: 'guided',
      isComplete: false,
    };
    assertType<WizardState>(state);
    assertType<number>(state.currentStep);
    assertType<boolean>(state.isComplete);
    expect(state.currentStep).toBe(0);
    expect(state.isComplete).toBe(false);
  });

  it('should support optional step-data fields', () => {
    const state: WizardState = {
      currentStep: 2,
      completedSteps: [0, 1],
      characterName: 'Theron',
      mode: 'guided',
      isComplete: false,
      raceSelection: { raceId: 'dwarf', subraceId: 'hill-dwarf' },
      classSelection: {
        classId: 'fighter',
        level: 1,
        chosenSkills: ['athletics', 'perception'],
        hpRolls: [],
      },
      abilityScores: {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      },
      abilityScoreMethod: 'standard',
    };
    assertType<WizardState>(state);
    expect(state.raceSelection).toBeDefined();
    expect(state.classSelection).toBeDefined();
    expect(state.abilityScores).toBeDefined();
    expect(state.backgroundSelection).toBeUndefined();
    expect(state.equipmentSelections).toBeUndefined();
    expect(state.spellSelections).toBeUndefined();
  });

  it('should support freeform mode', () => {
    const state: WizardState = {
      currentStep: 4,
      completedSteps: [0, 2, 3],
      characterName: 'Elara',
      mode: 'freeform',
      isComplete: false,
    };
    assertType<WizardState>(state);
    expect(state.mode).toBe('freeform');
  });
});

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------
describe('Theme', () => {
  it('should define Theme as dark or light', () => {
    const dark: Theme = 'dark';
    const light: Theme = 'light';
    assertType<Theme>(dark);
    assertType<Theme>(light);
    expect([dark, light]).toEqual(['dark', 'light']);
  });
});

// ---------------------------------------------------------------------------
// ToastMessage
// ---------------------------------------------------------------------------
describe('ToastMessage', () => {
  it('should define ToastMessage with id, type, message, and optional duration', () => {
    const success: ToastMessage = {
      id: 'toast-1',
      type: 'success',
      message: 'Character saved!',
      duration: 3000,
    };
    assertType<ToastMessage>(success);
    expect(success.type).toBe('success');
    expect(success.duration).toBe(3000);

    const error: ToastMessage = {
      id: 'toast-2',
      type: 'error',
      message: 'Failed to save character.',
    };
    assertType<ToastMessage>(error);
    expect(error.duration).toBeUndefined();

    const types: ToastMessage['type'][] = ['success', 'error', 'warning', 'info'];
    expect(types).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// ModalState
// ---------------------------------------------------------------------------
describe('ModalState', () => {
  it('should define ModalState with isOpen, type, and optional data', () => {
    const closed: ModalState = { isOpen: false, type: null };
    assertType<ModalState>(closed);
    expect(closed.isOpen).toBe(false);

    const open: ModalState = {
      isOpen: true,
      type: 'deleteCharacter',
      data: { characterId: 'char-001' },
    };
    assertType<ModalState>(open);
    expect(open.isOpen).toBe(true);
    expect(open.type).toBe('deleteCharacter');
  });
});

// ---------------------------------------------------------------------------
// UIState
// ---------------------------------------------------------------------------
describe('UIState', () => {
  it('should define UIState with activeModal, sidebarOpen, editMode, mobileNavOpen, diceRollerOpen', () => {
    const state: UIState = {
      activeModal: null,
      sidebarOpen: true,
      editMode: false,
      mobileNavOpen: false,
      diceRollerOpen: false,
    };
    assertType<UIState>(state);
    assertType<string | null>(state.activeModal);
    assertType<boolean>(state.sidebarOpen);
    assertType<boolean>(state.editMode);
    assertType<boolean>(state.mobileNavOpen);
    assertType<boolean>(state.diceRollerOpen);
    expect(state.activeModal).toBeNull();
    expect(state.sidebarOpen).toBe(true);
    expect(state.editMode).toBe(false);
    expect(state.mobileNavOpen).toBe(false);
    expect(state.diceRollerOpen).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// DieType (from core.ts, verified here for Story 2.10)
// ---------------------------------------------------------------------------
describe('DieType', () => {
  it('should define DieType with all 7 D&D dice (d4, d6, d8, d10, d12, d20, d100)', () => {
    // DieType is already defined in core.ts; verify it works in DiceGroup context
    const groups: DiceGroup[] = [
      { type: 'd4', count: 1 },
      { type: 'd6', count: 2 },
      { type: 'd8', count: 1 },
      { type: 'd10', count: 1 },
      { type: 'd12', count: 1 },
      { type: 'd20', count: 1 },
      { type: 'd100', count: 1 },
    ];
    groups.forEach((g) => assertType<DiceGroup>(g));
    expect(groups).toHaveLength(7);
  });
});

// ---------------------------------------------------------------------------
// DiceRoll
// ---------------------------------------------------------------------------
describe('DiceRoll', () => {
  it('should define DiceRoll with dice array, results, modifier, total, and timestamp', () => {
    const roll: DiceRoll = {
      id: 'roll-1',
      dice: [{ type: 'd20', count: 1 }],
      results: [15],
      modifier: 5,
      total: 20,
      timestamp: '2025-01-20T14:30:00Z',
    };
    assertType<DiceRoll>(roll);
    expect(roll.dice).toHaveLength(1);
    expect(roll.results).toEqual([15]);
    expect(roll.modifier).toBe(5);
    expect(roll.total).toBe(20);
    expect(roll.timestamp).toBeDefined();
  });

  it('should define DiceRoll with optional advantage and disadvantage boolean flags', () => {
    const advantageRoll: DiceRoll = {
      id: 'roll-2',
      dice: [{ type: 'd20', count: 2 }],
      results: [8, 17],
      modifier: 3,
      total: 20,
      label: 'Attack Roll',
      advantage: true,
      timestamp: '2025-01-20T14:31:00Z',
    };
    assertType<DiceRoll>(advantageRoll);
    expect(advantageRoll.advantage).toBe(true);
    expect(advantageRoll.disadvantage).toBeUndefined();

    const disadvantageRoll: DiceRoll = {
      id: 'roll-3',
      dice: [{ type: 'd20', count: 2 }],
      results: [17, 4],
      modifier: 3,
      total: 7,
      label: 'Saving Throw',
      disadvantage: true,
      timestamp: '2025-01-20T14:32:00Z',
    };
    assertType<DiceRoll>(disadvantageRoll);
    expect(disadvantageRoll.disadvantage).toBe(true);
  });

  it('should support multi-die rolls (e.g. 2d6 + 1d8)', () => {
    const roll: DiceRoll = {
      id: 'roll-4',
      dice: [
        { type: 'd6', count: 2 },
        { type: 'd8', count: 1 },
      ],
      results: [3, 5, 7],
      modifier: 4,
      total: 19,
      label: 'Fireball Damage',
      timestamp: '2025-01-20T14:33:00Z',
    };
    assertType<DiceRoll>(roll);
    expect(roll.dice).toHaveLength(2);
    expect(roll.results).toHaveLength(3);
    expect(roll.total).toBe(19);
  });
});

// ---------------------------------------------------------------------------
// DiceRollResult (alias)
// ---------------------------------------------------------------------------
describe('DiceRollResult', () => {
  it('should be an alias for DiceRoll', () => {
    const result: DiceRollResult = {
      id: 'roll-5',
      dice: [{ type: 'd20', count: 1 }],
      results: [20],
      modifier: 0,
      total: 20,
      label: 'Natural 20!',
      timestamp: '2025-01-20T15:00:00Z',
    };
    assertType<DiceRoll>(result);
    assertType<DiceRollResult>(result);
    expect(result.total).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// UserPreferences
// ---------------------------------------------------------------------------
describe('UserPreferences', () => {
  it('should define UserPreferences with diceAnimations, autoCalculate, theme, showTooltips', () => {
    const prefs: UserPreferences = {
      diceAnimations: true,
      autoCalculate: true,
      theme: 'dark',
      defaultAbilityScoreMethod: 'standard',
      showTooltips: true,
    };
    assertType<UserPreferences>(prefs);
    assertType<boolean>(prefs.diceAnimations);
    assertType<boolean>(prefs.autoCalculate);
    assertType<Theme>(prefs.theme);
    assertType<boolean>(prefs.showTooltips);
    expect(prefs.diceAnimations).toBe(true);
    expect(prefs.autoCalculate).toBe(true);
    expect(prefs.theme).toBe('dark');
    expect(prefs.showTooltips).toBe(true);
  });

  it('should support light theme', () => {
    const prefs: UserPreferences = {
      diceAnimations: false,
      autoCalculate: false,
      theme: 'light',
      defaultAbilityScoreMethod: 'pointBuy',
      showTooltips: false,
    };
    assertType<UserPreferences>(prefs);
    expect(prefs.theme).toBe('light');
  });
});

// ---------------------------------------------------------------------------
// SortOption & FilterOption
// ---------------------------------------------------------------------------
describe('SortOption', () => {
  it('should define SortOption with field, direction, and label', () => {
    const sort: SortOption = {
      field: 'name',
      direction: 'asc',
      label: 'Name (A-Z)',
    };
    assertType<SortOption>(sort);
    expect(sort.field).toBe('name');
    expect(sort.direction).toBe('asc');

    const sortDesc: SortOption = {
      field: 'level',
      direction: 'desc',
      label: 'Level (High to Low)',
    };
    assertType<SortOption>(sortDesc);
    expect(sortDesc.direction).toBe('desc');
  });
});

describe('FilterOption', () => {
  it('should define FilterOption with field, value, and label', () => {
    const filter: FilterOption = {
      field: 'class',
      value: 'fighter',
      label: 'Fighter',
    };
    assertType<FilterOption>(filter);
    expect(filter.field).toBe('class');
    expect(filter.value).toBe('fighter');
    expect(filter.label).toBe('Fighter');
  });
});

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
describe('Pagination', () => {
  it('should define Pagination with page, pageSize, totalItems, totalPages', () => {
    const pagination: Pagination = {
      page: 1,
      pageSize: 10,
      totalItems: 45,
      totalPages: 5,
    };
    assertType<Pagination>(pagination);
    expect(pagination.page).toBe(1);
    expect(pagination.pageSize).toBe(10);
    expect(pagination.totalItems).toBe(45);
    expect(pagination.totalPages).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Barrel Export Verification
// ---------------------------------------------------------------------------
describe('Barrel Export', () => {
  it('should export barrel file types/index.ts re-exporting all types from Stories 2.1-2.10', () => {
    // If this file compiles, the barrel export is working.
    // Verify key types from different story files are importable.
    const _character: Character | null = null;
    const _spell: Spell | null = null;
    const _race: Race | null = null;
    assertType<Character | null>(_character);
    assertType<Spell | null>(_spell);
    assertType<Race | null>(_race);
    expect(true).toBe(true);
  });

  it('should import Character, Spell, Race from @/types barrel export', () => {
    // The import at the top of this file demonstrates this works.
    // This test verifies the types are usable.
    const charSummary: Partial<Character> = { name: 'Test' };
    const spellPartial: Partial<Spell> = { name: 'Fireball' };
    const racePartial: Partial<Race> = { name: 'Elf' };
    assertType<Partial<Character>>(charSummary);
    assertType<Partial<Spell>>(spellPartial);
    assertType<Partial<Race>>(racePartial);
    expect(charSummary.name).toBe('Test');
    expect(spellPartial.name).toBe('Fireball');
    expect(racePartial.name).toBe('Elf');
  });
});
