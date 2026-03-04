# Story 3.5 — Background Data

> **Epic 3: SRD Game Data Layer** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need all SRD backgrounds with their proficiencies, equipment, features, and personality characteristic tables.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **SRD Backgrounds**: Each background provides a package of proficiencies, equipment, a feature, and personality characteristics. The SRD backgrounds include:
  - **Acolyte**: Skills: Insight, Religion. Languages: 2 of choice. Equipment: holy symbol, prayer book, 5 sticks of incense, vestments, common clothes, 15 gp. Feature: Shelter of the Faithful
  - **Charlatan**: Skills: Deception, Sleight of Hand. Tools: disguise kit, forgery kit. Equipment: fine clothes, disguise kit, con tools, 15 gp. Feature: False Identity
  - **Criminal/Spy**: Skills: Deception, Stealth. Tools: gaming set, thieves' tools. Equipment: crowbar, dark common clothes, 15 gp. Feature: Criminal Contact
  - **Entertainer**: Skills: Acrobatics, Performance. Tools: disguise kit, one musical instrument. Equipment: musical instrument, favor from admirer, costume, 15 gp. Feature: By Popular Demand
  - **Folk Hero**: Skills: Animal Handling, Survival. Tools: one artisan's tools, vehicles (land). Equipment: artisan's tools, shovel, iron pot, common clothes, 10 gp. Feature: Rustic Hospitality
  - **Guild Artisan**: Skills: Insight, Persuasion. Tools: one artisan's tools. Languages: 1 of choice. Equipment: artisan's tools, letter of introduction, traveler's clothes, 15 gp. Feature: Guild Membership
  - **Hermit**: Skills: Medicine, Religion. Tools: herbalism kit. Languages: 1 of choice. Equipment: scroll case with notes, winter blanket, common clothes, herbalism kit, 5 gp. Feature: Discovery
  - **Noble**: Skills: History, Persuasion. Tools: one gaming set. Languages: 1 of choice. Equipment: fine clothes, signet ring, scroll of pedigree, 25 gp. Feature: Position of Privilege
  - **Outlander**: Skills: Athletics, Survival. Tools: one musical instrument. Languages: 1 of choice. Equipment: staff, hunting trap, trophy, traveler's clothes, 10 gp. Feature: Wanderer
  - **Sage**: Skills: Arcana, History. Languages: 2 of choice. Equipment: bottle of black ink, quill, small knife, letter from colleague, common clothes, 10 gp. Feature: Researcher
  - **Sailor**: Skills: Athletics, Perception. Tools: navigator's tools, vehicles (water). Equipment: belaying pin (club), 50 ft silk rope, common clothes, 10 gp. Feature: Ship's Passage
  - **Soldier**: Skills: Athletics, Intimidation. Tools: one gaming set, vehicles (land). Equipment: insignia of rank, trophy, deck of cards or dice, common clothes, 10 gp. Feature: Military Rank
  - **Urchin**: Skills: Sleight of Hand, Stealth. Tools: disguise kit, thieves' tools. Equipment: small knife, map of home city, pet mouse, token of parents, common clothes, 10 gp. Feature: City Secrets
- **Personality characteristics**: Each background provides tables for roleplay: d8 personality traits, d6 ideals (each tagged with an alignment like Good, Lawful, Chaotic, Evil, Neutral, Any), d6 bonds, d6 flaws. Players can roll or choose
- **Skill overlap rule**: If a background grants a skill the character already has from their class, the player can choose any other skill as a replacement. This must be documented and enforced in the wizard

## Tasks
- [ ] **T3.5.1** — Create `data/backgrounds.ts` with all SRD backgrounds: Acolyte, Charlatan, Criminal/Spy, Entertainer, Folk Hero, Guild Artisan, Hermit, Noble, Outlander, Sage, Sailor, Soldier, Urchin — plus any additional SRD backgrounds
- [ ] **T3.5.2** — Each background must include: skill proficiencies, tool proficiencies, languages (fixed or choice), equipment list, feature (name + description), and personality characteristic tables (d8 personality traits, d6 ideals with alignment tags, d6 bonds, d6 flaws)
- [ ] **T3.5.3** — Validate that no background duplicates a class skill in a way that would create conflicts (note: if overlap occurs, player gets to choose a replacement — document this rule)

## Acceptance Criteria
- All 13+ SRD backgrounds are present with complete data
- Every background has complete personality characteristic tables (8 traits, 6 ideals, 6 bonds, 6 flaws)
- Ideals include alignment tags (Good, Evil, Lawful, Chaotic, Neutral, Any)
- Every background entry passes TypeScript type checking against the `Background` interface
- The skill overlap replacement rule is documented in the data or as a comment
- Language and tool choices are properly represented (fixed values vs player choice)

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should export backgrounds array with at least 13 SRD backgrounds`
- `should have Acolyte with skills Insight and Religion, and 2 language choices`
- `should have each background with 8 personality traits, 6 ideals, 6 bonds, 6 flaws`
- `should have ideals tagged with alignment (Good, Evil, Lawful, Chaotic, Neutral, Any)`
- `should have every background pass TypeScript type checking against Background interface`
- `should have Criminal/Spy modeled as single background with variant note`
- `should have backgrounds with correct tool proficiency choices (choose pattern)`
- `should document skill overlap replacement rule`

### Test Dependencies
- Background, PersonalityTrait type interfaces from Story 2.6
- Import via `@/data/backgrounds` path alias

## Identified Gaps

- **Edge Cases**: Skill overlap replacement rule is documented but not enforced in data; wizard UI must handle this at runtime
- **Dependency Issues**: Background equipment lists should reference item IDs from Story 3.4 but cross-referencing mechanism not specified

## Dependencies
- **Depends on:** Story 2.6 (Background, PersonalityTrait, BackgroundSelection types), Story 2.1 (SkillName), Story 2.3 (Feature)
- **Blocks:** Story 4.2 (Skill calculations consider background proficiencies), Story 4.8 (Character validation checks for duplicate skills), Epic 6 Story 6.2 (Wizard store background selection)

## Notes
- The Criminal variant "Spy" has the same mechanics as Criminal but with a different narrative flavor. Model as a single background with a note about the variant
- Some backgrounds grant tool choices (e.g., Folk Hero: "one type of artisan's tools") — these need the `choose` pattern in the data
- The skill overlap rule is important for the character creation wizard to handle correctly. When a player selects a background that grants a skill they already have from their class, the wizard must prompt them to choose a replacement
- Background features are narrative/roleplay abilities without mechanical game effects (unlike class features). They should still be stored in the `Feature` type but will not have `mechanicalEffect` populated
- Equipment lists reference items that should correspond to IDs in the adventuring gear data (Story 3.4)
