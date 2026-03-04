# Story 17.9 — Personality & Features (Right Column)

> **Epic 17: Character Sheet — Page 1 (Core Stats)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to see my personality traits, ideals, bonds, flaws, and features & traits in the right column.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Right Column Layout**: ~35% width on desktop. Contains personality traits block and features & traits list
- **Personality Block**: Four sections — Personality Traits (multi-line), Ideals (single), Bonds (single), Flaws (single). Data comes from background selection in the creation wizard
- **Features & Traits**: Aggregated from racial traits, class features, background feature, and feats. Grouped by source with collapsible sections
- **Features with Limited Uses**: Some features have usage counters (e.g., "Second Wind — 1/short rest", "Rage — 2/long rest"). Display as filled/empty circles for uses remaining
- **View Mode**: Parchment-background styled boxes for text. **Edit Mode**: Text areas become editable, features can be reordered/deleted/added

## Tasks
- [ ] **T17.9.1** — Create `components/character/page1/PersonalityBlock.tsx` — four sections stacked vertically: Personality Traits (multi-line), Ideals (single), Bonds (single), Flaws (single). Each has a header label and text content. In view mode, text is rendered in a styled box with parchment background. **Edit mode:** text areas become editable
- [ ] **T17.9.2** — Create `components/character/page1/FeaturesTraits.tsx` — a scrollable list below the personality block showing all features and traits: racial traits, class features, background feature, and feats. Each feature shows its name in bold and description below
- [ ] **T17.9.3** — Group features by source with subtle labels: "Racial Traits", "Class Features", "Background Feature", "Feats". Collapsible groups for space management
- [ ] **T17.9.4** — **Edit mode:** features can be reordered (drag handle), individually deleted, or custom features can be added via an "Add Feature" button with name and description fields
- [ ] **T17.9.5** — Features with limited uses (e.g., "Second Wind — 1/short rest", "Rage — 2/long rest") display usage counters: filled/empty circles indicating uses remaining

## Acceptance Criteria
- Four personality sections display with correct labels and content from the character data
- View mode renders text in styled parchment-background boxes
- Edit mode converts text blocks to editable text areas
- Features & traits list shows all features grouped by source (Racial, Class, Background, Feats)
- Feature groups are collapsible for space management
- Each feature shows name in bold and description below
- Edit mode allows reordering (drag handle), deleting, and adding custom features
- Features with limited uses show usage counter circles (filled/empty)
- The right column scrolls independently if content overflows

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should group features by source (Racial Traits, Class Features, Background Feature, Feats)`
- `should parse feature usage notation ("1/short rest", "2/long rest") into usage counter data`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render four personality sections (Personality Traits, Ideals, Bonds, Flaws) with correct labels`
- `should display personality text in styled parchment-background boxes in view mode`
- `should convert personality text blocks to editable text areas in edit mode`
- `should render features and traits list grouped by source with collapsible sections`
- `should display each feature with name in bold and description below`
- `should toggle feature groups collapsed/expanded on click`
- `should allow reordering features via drag handle in edit mode`
- `should allow deleting individual features in edit mode`
- `should show "Add Feature" button with name and description fields in edit mode`
- `should display usage counter circles (filled/empty) for features with limited uses`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should add a custom feature in edit mode, reorder it via drag, and verify it persists`

### Test Dependencies
- Mock character data with personality traits from background selection
- Mock character data with features from racial, class, background, and feat sources
- Mock features with limited uses (e.g., Second Wind, Rage)
- Mock view/edit mode context

## Identified Gaps

- **Loading/Empty States**: No specification for empty personality sections (no text entered)
- **Accessibility**: No ARIA labels for collapsible sections, no keyboard support for drag-and-drop reordering, no screen reader announcement for usage counter changes
- **Edge Cases**: No specification for very long feature descriptions (text truncation or overflow behavior)
- **Mobile/Responsive**: Right column scroll behavior mentioned but no specification for mobile stacking order

## Dependencies
- Phase 1 SRD data for racial traits, class features, and background features
- Phase 2 character data (personality traits from background selection, features from class/race)
- Epic 20 view/edit mode toggle system

## Notes
- Personality traits, ideals, bonds, and flaws are narrative text — they don't affect calculations
- Features with limited uses are session-tracking fields — usage resets on short or long rest (full rest mechanics are Phase 4)
- The features list can grow long for multiclass characters or characters with many feats — collapsible groups and scrolling are essential
- Custom features accommodate homebrew content and DM-granted abilities
