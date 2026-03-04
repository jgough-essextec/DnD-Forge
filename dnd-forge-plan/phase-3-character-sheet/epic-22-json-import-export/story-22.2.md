# Story 22.2 — JSON Import

> **Epic 22: JSON Import / Export** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to import a character from a JSON file, with validation that catches problems before corrupting my data.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Import Validation Pipeline (Gap S5)**: 5-stage validation:
  1. JSON syntax validation: parse the string, report syntax errors with line numbers
  2. Schema validation: check required fields exist (name, race, class, abilityScores, etc.)
  3. Type validation: check field types match the Character type system
  4. Reference validation: check raceId, classId, spell IDs, equipment IDs against SRD data
  5. Business rule validation: ability score ranges (3-30), level (1-20), HP consistency
- **Validation Result Levels**: Errors (red, blocks import), Warnings (yellow, allows import), Info (blue, informational)
- **Import Dialog**: Modal with file upload (drag-and-drop + file picker) and paste JSON textarea
- **ID Generation**: Always generate a new ID on import (never reuse imported ID to avoid conflicts)
- **Batch Import**: JSON with `characters` array allows selective or bulk import
- **Version Migration**: If `formatVersion` differs, apply migration transforms. Infrastructure in place for v1.0

## Tasks
- [ ] **T22.2.1** — Create `utils/characterImport.ts` with function `importCharacterFromJSON(jsonString: string): ImportResult` that parses, validates, and returns the character(s) or a list of errors
- [ ] **T22.2.2** — Create `components/gallery/ImportDialog.tsx` — a modal triggered from the gallery toolbar ("Import Character" button). Two input methods: file upload (drag-and-drop zone + file picker button) and paste JSON text (textarea for clipboard import)
- [ ] **T22.2.3** — **Validation pipeline:** Run the imported JSON through:
  1. JSON syntax validation -> "Invalid JSON: unexpected token at line N"
  2. Schema validation: check required fields exist (name, race, class, abilityScores, etc.) -> "Missing required field: abilityScores"
  3. Type validation: check field types match the Character type system -> "Field 'level' expected number, got string"
  4. Reference validation: check that raceId, classId, spell IDs, equipment IDs reference valid SRD data -> "Warning: spell 'fireball' not found in SRD data (will be imported as custom)"
  5. Business rule validation: check ability score ranges (3-30), level (1-20), HP consistency -> "Warning: HP max (45) doesn't match calculated value (42)"
- [ ] **T22.2.4** — Display validation results in the import dialog:
  - **Errors** (red, blocks import): malformed JSON, missing required fields
  - **Warnings** (yellow, allows import): computed value mismatches, unknown references
  - **Info** (blue): version differences, transient state omitted
- [ ] **T22.2.5** — On successful validation, show a character preview card in the dialog. "Import" button creates the character in IndexedDB with a newly generated ID (never use the imported ID to avoid conflicts). Set `createdAt` and `updatedAt` to now
- [ ] **T22.2.6** — **Batch import:** if the JSON contains a `characters` array, show all character previews and allow selective import ("Import All" or individual "Import" buttons per character)
- [ ] **T22.2.7** — **Version migration:** if the `formatVersion` in the import differs from the current app version, apply migration transforms. Create a `migrations/` directory with versioned migration functions. For v1.0 launch, this is a no-op but the infrastructure is in place

## Acceptance Criteria
- `importCharacterFromJSON` correctly parses and validates JSON input
- Import dialog provides file upload (drag-and-drop + file picker) and paste JSON textarea
- 5-stage validation pipeline runs with clear error messages at each stage
- Validation results display with appropriate color coding (red errors, yellow warnings, blue info)
- Errors block import; warnings allow import with acknowledgment
- Successful validation shows a character preview card
- Import creates the character with a new ID (never reuses imported ID)
- `createdAt` and `updatedAt` are set to the current time
- Batch import shows all character previews with selective and bulk import options
- Version migration infrastructure is in place (migrations directory with versioned functions)
- Drag-and-drop file upload works with visual feedback

## Dependencies
- Story 22.1 (JSON Export) — import must handle the export format
- Phase 1 Character type system for validation
- Phase 1 SRD data for reference validation (races, classes, spells, equipment)
- Phase 1 IndexedDB database layer for creating imported characters
- Story 21.1 (Gallery) — import dialog is triggered from the gallery toolbar

## Notes
- Reference validation (stage 4) should be lenient: unknown references produce warnings, not errors, to allow importing characters with homebrew content
- Business rule validation (stage 5) catches inconsistencies but doesn't block import — the calculation engine can fix computed values after import
- The version migration framework is forward-looking: for v1.0, all imports are format version "1.0" so no migration is needed
- The import dialog should show clear progress through the validation stages
- Drag-and-drop should show a highlighted drop zone when a file is dragged over the dialog
