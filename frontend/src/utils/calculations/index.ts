// =============================================================================
// Calculation Engine -- Barrel Export
// Re-exports all pure calculation functions from all calculation modules.
//
// Naming conflicts resolved:
// - getProficiencyBonus: exported from skills.ts (canonical), also in combat.ts
// - getAverageHPRoll: exported from levelup.ts (canonical), also in combat.ts
// =============================================================================

// -- ability.ts: all exports --------------------------------------------------
export * from './ability';

// -- skills.ts: all exports (canonical getProficiencyBonus) -------------------
export * from './skills';

// -- combat.ts: selective exports (skip getProficiencyBonus, getAverageHPRoll) -
export type {
  ArmorParams,
  SpecialACFormula,
  ArmorClassParams,
  MaxHitPointsParams,
} from './combat';

export {
  getArmorClass,
  getInitiativeModifier,
  getSpeed,
  getMaxHitPoints,
  getAttackBonus,
  getDamageBonus,
} from './combat';

// -- spellcasting.ts: all exports ---------------------------------------------
export * from './spellcasting';

// -- levelup.ts: all exports (canonical getAverageHPRoll) ---------------------
export * from './levelup';

// -- currency.ts: all exports -------------------------------------------------
export * from './currency';

// -- rest.ts: all exports -----------------------------------------------------
export * from './rest';

// -- validation.ts: all exports -----------------------------------------------
export * from './validation';
