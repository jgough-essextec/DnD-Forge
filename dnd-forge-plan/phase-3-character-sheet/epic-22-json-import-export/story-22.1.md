# Story 22.1 — JSON Export

> **Epic 22: JSON Import / Export** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to export a character as a JSON file so I can back it up, share it with others, or transfer to another device.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Export Format**: JSON with metadata wrapper containing `formatVersion`, `appVersion`, `exportedAt` (ISO timestamp), and the `character` object
- **Batch Export**: Multiple characters exported as a single JSON file with `characters` array
- **File Download**: Uses `URL.createObjectURL()` with Blob for browser download trigger
- **Filename Convention**: Single: `[CharacterName]_[Class]_Level[N].json`. Batch: `DnD_Forge_Export_[date].json`
- **Session State Toggle**: Option to exclude transient session state (current HP, used spell slots, hit dice used, death saves, temp HP) for clean exports
- **Access Points**: Gallery card context menu, character sheet header, batch export from gallery select mode

## Tasks
- [ ] **T22.1.1** — Create `utils/characterExport.ts` with function `exportCharacterAsJSON(character: Character): string` that serializes the full character object to formatted JSON. Include a metadata wrapper: `{ formatVersion: "1.0", appVersion: "x.y.z", exportedAt: ISO timestamp, character: { ... } }`
- [ ] **T22.1.2** — Trigger download as a `.json` file named `[CharacterName]_[Class]_Level[N].json` (sanitize filename characters). Use `URL.createObjectURL()` with Blob for the download trigger
- [ ] **T22.1.3** — Accessible from: gallery card context menu "Export as JSON", character sheet header "Export" button, and batch export from gallery select mode
- [ ] **T22.1.4** — **Batch export:** when multiple characters are selected, export as a single JSON file with array wrapper: `{ formatVersion: "1.0", characters: [...] }`. Filename: `DnD_Forge_Export_[date].json`
- [ ] **T22.1.5** — Exclude transient state from the export: remove `hitPointCurrent` (export `hitPointMax` only), `usedSpellSlots`, `hitDiceUsed`, `deathSaves`, `tempHitPoints` — these are session-specific. Include an option toggle: "Include session state" for full exports

## Acceptance Criteria
- `exportCharacterAsJSON` serializes a character with metadata wrapper (formatVersion, appVersion, exportedAt)
- Export triggers a browser download of a `.json` file
- Filename follows the convention `[CharacterName]_[Class]_Level[N].json` with sanitized characters
- Export is accessible from gallery card context menu, character sheet header, and batch mode
- Batch export creates a single JSON file with all selected characters
- Batch filename follows `DnD_Forge_Export_[date].json` convention
- Transient session state is excluded by default from exports
- "Include session state" toggle allows full export when needed
- Exported JSON is formatted (pretty-printed) for readability

## Dependencies
- Phase 1 Character type system for serialization
- Story 21.1 (Gallery) — export accessible from gallery card context menu
- Story 21.3 (Quick Actions) — export is one of the quick actions

## Notes
- Filename sanitization should replace special characters (/, \, :, *, ?, ", <, >, |) with underscores
- The formatVersion ("1.0") establishes a versioning scheme for future import compatibility
- Session state exclusion makes exports more portable — recipients start with a "fresh" character rather than inheriting mid-session state
- The "Include session state" option is useful for personal backups where preserving exact state matters
- Exported JSON should be human-readable (formatted with indentation)
