# Story 32.2 — Pinned Skills & Customization

> **Epic 32: Session Play Compact View** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player, I want to choose which skills and abilities appear in my session compact view so I see what's relevant to my character. Different characters use different skills most frequently -- a Rogue needs Stealth, Perception, and Sleight of Hand, while a Bard needs Persuasion, Deception, and Performance. The pinned skills system lets each player customize their session view with up to 8 of the most relevant skills and saves.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### All 18 D&D 5e Skills (Grouped by Ability)

**Strength:**
- Athletics

**Dexterity:**
- Acrobatics, Sleight of Hand, Stealth

**Intelligence:**
- Arcana, History, Investigation, Nature, Religion

**Wisdom:**
- Animal Handling, Insight, Medicine, Perception, Survival

**Charisma:**
- Deception, Intimidation, Performance, Persuasion

### All 6 Saving Throws
- Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma

### Default Pinned Selection (by Class)
| Class | Default Pinned Skills |
|-------|----------------------|
| Barbarian | Athletics, Perception, Stealth, Intimidation + STR Save, CON Save |
| Bard | Perception, Persuasion, Stealth, Performance + CHA Save, DEX Save |
| Cleric | Perception, Insight, Medicine, Religion + WIS Save, CHA Save |
| Druid | Perception, Nature, Survival, Animal Handling + WIS Save, INT Save |
| Fighter | Athletics, Perception, Stealth, Intimidation + STR Save, CON Save |
| Monk | Stealth, Perception, Acrobatics, Athletics + STR Save, DEX Save |
| Paladin | Athletics, Perception, Persuasion, Insight + WIS Save, CHA Save |
| Ranger | Stealth, Perception, Survival, Nature + STR Save, DEX Save |
| Rogue | Stealth, Perception, Sleight of Hand, Deception + DEX Save, INT Save |
| Sorcerer | Perception, Persuasion, Arcana, Deception + CON Save, CHA Save |
| Warlock | Perception, Deception, Intimidation, Arcana + WIS Save, CHA Save |
| Wizard | Perception, Investigation, Arcana, History + INT Save, WIS Save |

**Limit:** 8 pinned items maximum (skills + saves combined)

### Persistence
- Pinned selections are stored per-character (not global) in the character data
- Each character can have a different pinned configuration
- Persisted to IndexedDB via the auto-save system

### Pin Star on Full Sheet
A star icon on each skill/save in the full character sheet allows quick add/remove from the session view pinned list, providing a fast alternative to opening the settings modal.

### Session View Display
Pinned skills in the session view show:
- Skill name (abbreviated if needed for space)
- Modifier in large font (tappable to roll)
- Proficiency indicator dot (filled = proficient, half-filled = half-proficient, empty = not proficient)
- Grouped by ability score with the ability abbreviation as a section header (e.g., "DEX" header above Stealth and Acrobatics)

## Tasks

- [ ] **T32.2.1** — Create a "Customize Session View" settings modal: checkboxes for all 18 skills and 6 saves. Default pinned: class-primary skills + Perception + Stealth + Athletics + Investigation. Limit: 8 pinned items
- [ ] **T32.2.2** — Persist pinned selections in the character data (per-character, not global)
- [ ] **T32.2.3** — Add a "Pin" star icon to skills in the full character sheet: toggling it adds/removes the skill from the session view
- [ ] **T32.2.4** — Pinned skills in session view show: skill name, modifier (large font, rollable), and proficiency dot. Grouped by ability score with the ability abbreviation as a section header

## Acceptance Criteria

1. "Customize Session View" settings modal shows checkboxes for all 18 skills and 6 saves
2. Default pinned selection matches the character's class
3. Maximum of 8 pinned items enforced (UI prevents adding more)
4. Pinned selections are stored per-character in the character data
5. Pinned selections persist across page refreshes (IndexedDB)
6. Star icon on skills in the full character sheet toggles pinning
7. Star icon reflects current pinned state (filled = pinned, empty = not pinned)
8. Session view displays pinned skills with: name, modifier (large, rollable), proficiency dot
9. Pinned skills are grouped by ability score with abbreviation headers
10. Tapping a pinned skill modifier triggers a dice roll (1d20 + modifier)

## Dependencies

- Story 32.1 (Compact Session Mode) for the session view container
- Phase 3 character sheet skills section (for pin star placement)
- Phase 3 auto-save system (for persistence)

## Notes

- The class-specific defaults are important for a good out-of-the-box experience
- Perception is universally useful and should be pinned by default for all classes
- The 8-item limit keeps the session view compact -- if players want more, they can use the full sheet
- The pin star on the full sheet provides a seamless way to customize without opening settings
- Consider showing a count indicator in the settings: "5/8 pinned" so the player knows their remaining budget
