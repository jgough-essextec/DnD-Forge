# Story 18.2 — Backstory & Additional Features

> **Epic 18: Character Sheet — Page 2 (Backstory & Details)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to see my character's backstory narrative and any additional features that overflow from Page 1.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Right Column Layout**: The right column (~65% on desktop) contains the backstory block, additional features section, and treasure section stacked vertically
- **Backstory Block**: Large text block supporting markdown-lite formatting (bold, italic, headers). Soft warning at 5,000 characters (no hard limit)
- **Additional Features**: Overflow section for features that don't fit on Page 1 — multiclass features, homebrew abilities, DM-granted boons. Same format as Page 1 features section
- **Edit Mode**: Backstory becomes a rich textarea with basic formatting toolbar. Additional features use same edit controls as Page 1 features

## Tasks
- [ ] **T18.2.1** — Create `components/character/page2/BackstoryBlock.tsx` — a large text block in the right column for the character's backstory. In view mode, renders the text with proper paragraph formatting. Supports markdown-lite (bold, italic, headers) for structured backstories
- [ ] **T18.2.2** — **Edit mode:** backstory becomes a rich textarea with basic formatting toolbar (bold, italic, heading). Character count display. No hard limit but soft warning at 5,000 characters
- [ ] **T18.2.3** — Create `components/character/page2/AdditionalFeatures.tsx` — a secondary features section below backstory for overflow from Page 1's features list, multiclass features, homebrew abilities, or DM-granted boons. Same format as the Page 1 features section but with an "Additional" label
- [ ] **T18.2.4** — **Edit mode:** same edit controls as Page 1 features — add, remove, reorder, edit name and description

## Acceptance Criteria
- Backstory block renders in the right column with proper paragraph formatting
- Markdown-lite formatting (bold, italic, headers) renders correctly in view mode
- Edit mode provides a rich textarea with formatting toolbar (bold, italic, heading)
- Character count displays during editing with soft warning at 5,000 characters
- Additional Features section renders below backstory with an "Additional" label
- Additional Features uses the same format as Page 1 features (name in bold, description below)
- Edit mode for Additional Features supports add, remove, reorder, and edit operations
- Both sections handle empty states gracefully

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should parse markdown-lite formatting (bold, italic, headers) in backstory text`
- `should compute character count from backstory text`
- `should trigger soft warning when backstory exceeds 5,000 characters`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render backstory block in the right column with proper paragraph formatting`
- `should render markdown-lite formatting (bold, italic, headers) correctly in view mode`
- `should provide rich textarea with formatting toolbar (bold, italic, heading) in edit mode`
- `should display character count during editing`
- `should show soft warning at 5,000 characters without blocking input`
- `should render Additional Features section below backstory with "Additional" label`
- `should display Additional Features in same format as Page 1 features (name bold, description below)`
- `should support add, remove, reorder, and edit operations for Additional Features in edit mode`
- `should handle empty backstory with placeholder text`
- `should handle empty Additional Features with graceful empty state`

### Test Dependencies
- Mock character data with backstory text (plain and with markdown-lite formatting)
- Mock character data with additional features (multiple items)
- Mock character data with empty backstory and no additional features
- Mock view/edit mode context

## Identified Gaps

- **Error Handling**: No specification for malformed markdown-lite input handling
- **Accessibility**: No ARIA labels for formatting toolbar buttons, no keyboard shortcuts for formatting (Ctrl+B, Ctrl+I)
- **Performance**: No specification for rendering performance with very long backstory text (5,000+ characters)

## Dependencies
- Story 17.9 (Personality & Features) — Additional Features uses same format as Page 1 features
- Epic 20 view/edit mode toggle system
- Phase 2 character data (backstory text from creation wizard)

## Notes
- Backstory is a narrative text field — it can be lengthy and benefits from formatting support
- The markdown-lite support should be lightweight (no heavy library) — just bold (**text**), italic (*text*), and headers (# Header)
- Additional Features accommodates growth: multiclass features, DM-granted boons, and homebrew abilities that accumulate over a campaign
- At character creation, backstory may be minimal or empty — show a placeholder prompting the player to write their story
