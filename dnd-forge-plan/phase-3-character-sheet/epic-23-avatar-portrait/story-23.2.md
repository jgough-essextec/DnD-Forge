# Story 23.2 — Avatar Display Across the App

> **Epic 23: Character Avatar / Portrait System** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a developer, I need the avatar component to render consistently in all contexts — gallery cards, sheet header, shared views.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Reusable Avatar Component**: `CharacterAvatar` renders the avatar image if present or the default placeholder at configurable sizes
- **Size Variants**: sm (32px), md (48px), lg (64px), xl (128px)
- **Display Contexts**:
  - Gallery card: `size="lg"` (64px) at the top of the card
  - Character sheet banner: `size="xl"` (128px) with circular mask
  - Shared view: `size="xl"` (128px), no edit capability
  - DM party view (future): `size="md"` (48px) next to character name
- **Editable Prop**: When `editable=true`, shows upload icon on hover
- **Visual Style**: Parchment-textured border ring around all avatars for dark fantasy aesthetic

## Tasks
- [ ] **T23.2.1** — Create `components/shared/CharacterAvatar.tsx` — a reusable avatar component. Props: `character` (for data), `size` ('sm' | 'md' | 'lg' | 'xl' mapping to 32/48/64/128px), `editable` (shows upload icon on hover). Renders the avatar image if present or the default placeholder
- [ ] **T23.2.2** — Gallery card: `size="lg"` (64px) at the top of the card
- [ ] **T23.2.3** — Character sheet banner: `size="xl"` (128px) with circular mask
- [ ] **T23.2.4** — Shared view: `size="xl"` (128px), no edit capability
- [ ] **T23.2.5** — DM party view (future): `size="md"` (48px) next to character name in the party grid
- [ ] **T23.2.6** — Apply a subtle parchment-textured border ring around all avatars to match the app's dark fantasy aesthetic

## Acceptance Criteria
- `CharacterAvatar` component renders correctly at all four size variants (32/48/64/128px)
- Avatar image displays when present in character data
- Default placeholder displays when no avatar is set (race silhouette + class color)
- `editable` prop shows upload icon overlay on hover
- Gallery card uses `size="lg"` (64px)
- Character sheet banner uses `size="xl"` (128px) with circular mask
- Shared view uses `size="xl"` (128px) without edit capability
- Parchment-textured border ring renders around all avatars
- Component is reusable across all app contexts

## Testing Requirements

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render CharacterAvatar at all four size variants (32px, 48px, 64px, 128px)`
- `should display avatar image when present in character data`
- `should display default placeholder when no avatar is set (race silhouette + class color)`
- `should show upload icon overlay on hover when editable prop is true`
- `should not show upload icon when editable prop is false`
- `should render with circular mask on character sheet banner (size="xl")`
- `should render parchment-textured border ring around all avatars`
- `should render correctly in gallery card context (size="lg", 64px)`
- `should render correctly in shared view context (size="xl", 128px, not editable)`

### Test Dependencies
- Mock character data with avatar (base64 data URL)
- Mock character data without avatar (various race/class combinations for default generation)
- Mock CSS for parchment border texture

## Identified Gaps

- **Accessibility**: No alt text specification for avatar images, no ARIA labels for editable overlay, no screen reader description for default placeholders
- **Performance**: No specification for rendering performance with many avatars simultaneously (gallery with 50+ cards)
- **Edge Cases**: No specification for handling corrupted base64 avatar data (fallback to default)

## Dependencies
- Story 23.1 (Avatar Upload & Storage) — provides avatar data and default generation
- Story 17.1 (Sheet Banner) — avatar displays in the banner
- Story 21.1 (Gallery Cards) — avatar displays on cards
- Story 22.3 (Share View) — avatar displays in shared view

## Notes
- The CharacterAvatar component should be pure and stateless — it renders based on the character data passed to it
- The `editable` prop only controls the hover overlay visual; the actual upload dialog is triggered by the parent component
- The parchment border ring should be subtle enough not to distract but consistent with the app's dark fantasy theme
- Future DM party view (Phase 5+) will use the md size — the component should be ready for it
- The circular mask on the character sheet banner uses CSS `border-radius: 50%` with `overflow: hidden`
