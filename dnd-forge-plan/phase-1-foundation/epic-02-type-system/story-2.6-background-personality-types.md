# Story 2.6 — Background & Personality Types

> **Epic 2: Complete Type System** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need types for backgrounds and the personality/roleplaying system.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **D&D 5e Backgrounds**: Each background grants 2 skill proficiencies, tool proficiencies, languages (fixed or choice), starting equipment, and a unique feature. SRD backgrounds include: Acolyte, Charlatan, Criminal/Spy, Entertainer, Folk Hero, Guild Artisan, Hermit, Noble, Outlander, Sage, Sailor, Soldier, Urchin, and others
- **Personality characteristics**: Each background provides tables for roleplaying — d8 personality traits, d6 ideals (with alignment tags), d6 bonds, d6 flaws. Players can roll or choose from these tables
- **Background feature**: A non-combat narrative ability (e.g., Acolyte's "Shelter of the Faithful" provides free healing and services at temples)
- **Skill overlap rule**: If a background grants a skill proficiency that the character already has from their class, the player gets to choose a replacement skill proficiency
- **Character description**: Physical appearance and personality details stored on the character: name, age, height, weight, eyes, skin, hair, appearance description, backstory, allies/organizations, and treasure notes

## Tasks
- [ ] **T2.6.1** — Define `PersonalityTrait` interface: `{ id: string; text: string }`
- [ ] **T2.6.2** — Define `Background` interface: `{ id, name, description, skillProficiencies: SkillName[], toolProficiencies: string[], languages: { choose: number } | string[], equipment: string[], feature: Feature, personalityTraits: PersonalityTrait[], ideals: PersonalityTrait[], bonds: PersonalityTrait[], flaws: PersonalityTrait[], suggestedCharacteristics?: string }`
- [ ] **T2.6.3** — Define `BackgroundSelection` interface (saved on character): `{ backgroundId: string; chosenSkills?: SkillName[]; chosenLanguages?: string[]; chosenTools?: string[] }`
- [ ] **T2.6.4** — Define `CharacterDescription` interface: `{ name: string; age: string; height: string; weight: string; eyes: string; skin: string; hair: string; appearance: string; backstory: string; alliesAndOrgs: string; treasure: string }`

## Acceptance Criteria
- All types compile with zero TypeScript errors under strict mode
- `Background` interface can represent all SRD backgrounds including their personality characteristic tables
- `Background.languages` supports both fixed languages (string array) and choice-based languages (`{ choose: number }`)
- `BackgroundSelection` captures all player choices during background selection
- `CharacterDescription` includes all physical and personality description fields
- `PersonalityTrait` is generic enough to represent personality traits, ideals, bonds, and flaws

## Dependencies
- **Depends on:** Story 2.1 (uses SkillName), Story 2.3 (uses Feature type for background feature)
- **Blocks:** Story 2.8 (Character master type includes BackgroundSelection and CharacterDescription), Story 3.5 (Background data files)

## Notes
- The `Background.languages` field uses a union type because some backgrounds grant specific languages (e.g., Sage gets two languages of choice = `{ choose: 2 }`) while others grant fixed languages
- Ideals in the personality trait table often have alignment tags (e.g., "Charity. I always try to help those in need. (Good)"). Consider adding an optional `alignment` field to `PersonalityTrait` for ideals
- The `BackgroundSelection.chosenSkills` field is used when the player needs to replace a background skill due to overlap with class skills
- `CharacterDescription` fields are all strings to allow freeform input. The `age` field is a string rather than a number because D&D races have very different lifespans and players may write "250 years" or "young adult"
