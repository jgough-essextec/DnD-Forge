# Story 31.4 — Subclass Selection Step (Conditional)

> **Epic 31: Level Up Flow** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player reaching a subclass selection level, I need to choose my subclass with full information about each option. This step is conditionally rendered only when the character reaches their class's specific subclass level and hasn't yet chosen a subclass. It provides full descriptions and feature previews for all available subclass options and updates the character's class display upon selection.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### D&D 5e Subclass System (Complete)

**Subclass Selection Levels:**
| Class | Subclass Level | Subclass Name | SRD Options |
|-------|---------------|---------------|-------------|
| Barbarian | 3 | Primal Path | Path of the Berserker |
| Bard | 3 | Bard College | College of Lore |
| Cleric | 1 | Divine Domain | Life Domain |
| Druid | 2 | Druid Circle | Circle of the Land |
| Fighter | 3 | Martial Archetype | Champion |
| Monk | 3 | Monastic Tradition | Way of the Open Hand |
| Paladin | 3 | Sacred Oath | Oath of Devotion |
| Ranger | 3 | Ranger Archetype | Hunter |
| Rogue | 3 | Roguish Archetype | Thief |
| Sorcerer | 1 | Sorcerous Origin | Draconic Bloodline |
| Warlock | 1 | Otherworldly Patron | The Fiend |
| Wizard | 2 | Arcane Tradition | School of Evocation |

**Classes with Level 1 Subclass (chosen during creation):**
- Cleric (Domain), Sorcerer (Origin), Warlock (Patron)
- These classes skip the subclass selection step during level-up because the subclass was chosen at character creation
- Instead, subclass features granted at higher levels are applied automatically

**Subclass Feature Levels:**
Each subclass grants features at specific levels. These features are applied automatically at the appropriate levels (no re-selection needed):

| Class | Subclass Feature Levels |
|-------|------------------------|
| Barbarian | 3, 6, 10, 14 |
| Bard | 3, 6, 14 |
| Cleric | 1, 2, 6, 8, 17 |
| Druid | 2, 6, 10, 14 |
| Fighter | 3, 7, 10, 15, 18 |
| Monk | 3, 6, 11, 17 |
| Paladin | 3, 7, 15, 20 |
| Ranger | 3, 7, 11, 15 |
| Rogue | 3, 9, 13, 17 |
| Sorcerer | 1, 6, 14, 18 |
| Warlock | 1, 6, 10, 14 |
| Wizard | 2, 6, 10, 14 |

**Subclass Selection UI:**
- Show all available subclass options for the class
- Each option shows: name, flavor description, features gained at the current level, preview of features at future levels
- Reuse the SubclassSelector component from Phase 2 (Story 10.4)

**Class Display Update:**
After subclass selection, the character's class display updates to include the subclass name:
- "Level 3 Fighter" -> "Level 3 Champion Fighter"
- "Level 3 Rogue" -> "Level 3 Thief Rogue"

## Tasks

- [ ] **T31.4.1** — Create `components/levelup/SubclassSelectionStep.tsx` — conditionally rendered when the character reaches their class's subclass level and hasn't yet chosen one. Reuses the SubclassSelector from Phase 2 (Story 10.4) in a modal context
- [ ] **T31.4.2** — Show all available subclass options for the class with: name, description, features gained at this level, and a preview of features at future levels
- [ ] **T31.4.3** — On selection, add the subclass's features to the character and update the class display on the banner: "Level 3 Champion Fighter" or "Level 3 Thief Rogue"
- [ ] **T31.4.4** — For classes that chose their subclass at level 1 (Cleric, Sorcerer, Warlock), this step is skipped during level-up (already chosen during creation). Instead, apply the subclass features granted at higher levels automatically

## Acceptance Criteria

1. Subclass selection step appears only at the correct level for each class
2. Step does not appear if a subclass has already been chosen
3. All available subclass options are shown with name, description, and features
4. Current-level features are displayed prominently
5. Future-level features are shown as a preview
6. SubclassSelector from Phase 2 is reused in the modal context
7. On selection, subclass features are added to the character
8. Class display updates to include subclass name (e.g., "Level 3 Champion Fighter")
9. Cleric, Sorcerer, and Warlock skip this step (subclass chosen at creation)
10. For classes with level 1 subclass, higher-level subclass features are applied automatically

## Dependencies

- Story 31.1 (Level Up Entry & Overview) for the wizard container
- Phase 2, Story 10.4: SubclassSelector component (reused)
- Phase 1 subclass data (features by level)

## Notes

- The SubclassSelector from Phase 2 should be reusable with minimal modification
- Future feature preview helps players make informed subclass choices
- The SRD includes one subclass per class; the data model should support additional subclasses from other sources
- Subclass selection is a one-time, permanent choice that significantly defines the character's playstyle
