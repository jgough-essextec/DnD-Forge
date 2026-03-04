# Story 10.2 — Class Detail Panel

> **Epic 10: Class Selection Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, I need to see the full details of a class — proficiencies, starting features, equipment options, and spellcasting info — before committing. This story builds a comprehensive slide-in detail panel with multiple sections covering all class information relevant to level-1 character creation and a preview of the level progression.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Panel Layout**: Slide-in panel mirroring the Race Detail Panel — right side on desktop, bottom sheet on mobile, animated with framer-motion
- **Panel Sections**:
  - Overview: class description, hit die, primary ability, saving throw proficiencies
  - Proficiencies: armor, weapon, tool proficiencies
  - Level 1 Features: all features gained at level 1 with full descriptions; features involving choices noted
  - Spellcasting Preview (casters only): spellcasting type, ability, cantrips/spells at level 1
  - Level Progression Preview: compact 1-20 table (read-only informational)
  - Starting Equipment Preview: equipment choice groups as a preview (actual selection in Step 5)
- **Features with Choices at Level 1**: Fighting Style (Fighter, Paladin, Ranger), Expertise (Rogue — choose 2 skills), Spellcasting (all casters)
- **Subclass at Level 1**: Cleric (Divine Domain at 1), Sorcerer (Sorcerous Origin at 1), Warlock (Otherworldly Patron at 1). Other classes choose subclass at level 2 or 3

## Tasks

- [ ] **T10.2.1** — Create `components/wizard/class/ClassDetailPanel.tsx` — slide-in panel with tabbed or scrollable sections
- [ ] **T10.2.2** — "Overview" section: class description, hit die, primary ability recommendation, saving throw proficiencies
- [ ] **T10.2.3** — "Proficiencies" section: armor proficiencies (listed with icons), weapon proficiencies, tool proficiencies
- [ ] **T10.2.4** — "Level 1 Features" section: list each feature the class gains at level 1 with full description. Expandable cards for long descriptions (e.g., Rage, Spellcasting, Fighting Style). Features that involve choices (Fighting Style, Expertise) should be noted with "You'll choose this during creation"
- [ ] **T10.2.5** — "Spellcasting Preview" section (casters only): brief summary of spellcasting type (prepared vs. known vs. pact), spellcasting ability, cantrips known at level 1, spells known/prepared at level 1, and a note about when spell selection happens (Step 6)
- [ ] **T10.2.6** — "Level Progression Preview" section: a compact table showing key features gained at each level (1-20). Highlight subclass selection level, ASI levels, and notable power spikes. This is read-only informational content
- [ ] **T10.2.7** — "Starting Equipment Preview" section: show the equipment choice groups (e.g., "(a) chain mail OR (b) leather armor + longbow + 20 arrows") as a preview. Note that actual selection happens in Step 5

## Acceptance Criteria

- Clicking a class card opens a slide-in detail panel with animated entrance
- Overview section shows class description, hit die, primary ability, and saving throw proficiencies
- Proficiencies section lists all armor, weapon, and tool proficiencies with icons
- Level 1 Features section lists all features with expandable descriptions; choice features are noted
- Spellcasting Preview section appears only for caster classes and shows type, ability, cantrip/spell counts
- Level Progression table shows features for levels 1-20 with subclass, ASI, and power spike highlights
- Starting Equipment Preview shows choice groups as read-only text
- The panel is scrollable and works on both desktop (right side) and mobile (bottom sheet)

## Dependencies

- **Depends on:** Story 10.1 (Class Card Gallery — selection triggers panel open), Epic 16 Story 16.1 (DetailSlidePanel), Phase 1 SRD class data
- **Blocks:** Stories 10.3-10.5 (skill selection, subclass selection, and fighting style are interactive components within or alongside this panel)

## Notes

- The Level Progression table is informational only — it helps players see what they'll get at higher levels before committing to a class
- Highlight key levels in the progression table: subclass level (varies by class), ASI levels (4, 8, 12, 16, 19 for most classes), and Extra Attack (level 5 for martial classes)
- Long feature descriptions (e.g., Barbarian's Rage, Wizard's Spellcasting) should default to collapsed with "Read more" toggle to keep the panel manageable
- Equipment preview should match the nested choice format (e.g., "(a) chain mail OR (b) leather armor, longbow, and 20 arrows") to set expectations for Step 5
- For non-caster classes, the Spellcasting Preview section should be hidden entirely rather than showing "None"
