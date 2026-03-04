# Story 6.1 — Character Store

> **Epic 6: Zustand State Management Stores** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need React Query hooks for character data (server state) and a minimal Zustand store for UI-only character selection state, so that all character data flows through the Django REST API with automatic caching, background refetching, and cache invalidation on mutations.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **React Query**: Server state library that manages fetching, caching, synchronizing, and updating server data. Provides `useQuery` for reads, `useMutation` for writes, automatic cache invalidation via `queryClient.invalidateQueries()`, and built-in loading/error states
- **Zustand**: Used only for UI-local state. The character store holds a single `activeCharacterId` pointer — no character data lives in Zustand
- **API layer**: An Axios-based API module (`api/characters.ts`) provides typed functions for all character endpoints: `getCharacters()`, `getCharacter(id)`, `createCharacter(data)`, `updateCharacter(id, data)`, `deleteCharacter(id)`
- **Query keys**: `['characters']` for the list, `['character', id]` for a single character. Mutations invalidate these keys to keep the cache fresh
- **Derived stats**: The Django backend computes all derived stats (AC, HP, modifiers, etc.) and returns them in the character response. The frontend does not run a calculation engine — it displays what the API returns

## Tasks
- [ ] **T6.1.1** — Create `api/characters.ts` — Axios API layer with typed functions: `getCharacters(): Promise<CharacterSummary[]>`, `getCharacter(id: string): Promise<Character>`, `createCharacter(data: CreateCharacterPayload): Promise<Character>`, `updateCharacter(id: string, data: Partial<Character>): Promise<Character>`, `deleteCharacter(id: string): Promise<void>`
- [ ] **T6.1.2** — Create `hooks/useCharacters.ts` — `useCharacters()` hook wrapping `useQuery(['characters'], () => api.getCharacters())` for fetching the character list with loading and error states
- [ ] **T6.1.3** — Create `hooks/useCharacter.ts` — `useCharacter(id)` hook wrapping `useQuery(['character', id], () => api.getCharacter(id), { enabled: !!id })` for fetching a single character
- [ ] **T6.1.4** — Create `hooks/useCharacterMutations.ts` — `useCreateCharacter()`, `useUpdateCharacter()`, `useDeleteCharacter()` hooks using `useMutation` with `onSuccess` callbacks that call `queryClient.invalidateQueries(['characters'])` and `queryClient.invalidateQueries(['character', id])` as appropriate
- [ ] **T6.1.5** — Create `stores/uiStore.ts` with Zustand — state: `{ activeCharacterId: string | null }`, action: `setActiveCharacterId(id: string | null)`. No character data in Zustand
- [ ] **T6.1.6** — Write tests: Vitest + MSW for React Query hook tests (mock API responses), simple Zustand tests for UI store

## Acceptance Criteria
- React Query manages all character server state — no character data is stored in Zustand
- `useCharacters()` returns `{ data, isLoading, isError, error }` for the character list
- `useCharacter(id)` returns `{ data, isLoading, isError, error }` for a single character, and is disabled when `id` is null/undefined
- `useCreateCharacter()` posts to the API and invalidates the `['characters']` query cache on success
- `useUpdateCharacter()` patches the API and invalidates both `['characters']` and `['character', id]` query caches on success
- `useDeleteCharacter()` deletes via the API and invalidates the `['characters']` query cache on success
- Zustand `uiStore` only holds `activeCharacterId` — a pointer, not data
- Loading and error states are provided by React Query (no manual `loading`/`error` flags)
- The API layer uses Axios with proper TypeScript return types
- Tests use MSW to mock API responses and verify hook behavior

## Testing Requirements

### Unit Tests (Vitest)
_For Zustand store logic and API layer functions_

- `should initialize uiStore with activeCharacterId null`
- `should set activeCharacterId via setActiveCharacterId`
- `should clear activeCharacterId by setting null`
- `should export getCharacters, getCharacter, createCharacter, updateCharacter, deleteCharacter from API layer`

### Hook Tests (Vitest + MSW + renderHook)
_For React Query hooks with mocked API responses_

- `should return character list data via useCharacters on successful fetch`
- `should return isLoading true while useCharacters fetch is in progress`
- `should return isError true when useCharacters fetch fails`
- `should return single character data via useCharacter(id) on successful fetch`
- `should not fetch when useCharacter is called with null id (enabled: false)`
- `should invalidate characters query cache after useCreateCharacter succeeds`
- `should invalidate characters and character query caches after useUpdateCharacter succeeds`
- `should invalidate characters query cache after useDeleteCharacter succeeds`
- `should return error state when mutation fails`

### Test Dependencies
- MSW (Mock Service Worker) for API request interception
- `@testing-library/react` with `renderHook` for hook testing
- React Query `QueryClientProvider` wrapper for test renders
- Character and CharacterSummary type fixtures

## Identified Gaps

- **Optimistic Updates**: Whether mutations should use optimistic updates (update cache before server confirms) is not specified. Consider adding for `useUpdateCharacter` to improve perceived performance
- **Error Handling**: How mutation errors surface to the user (toast, inline, etc.) is not defined at this layer — that is a UI concern for Phase 2
- **Stale Time**: React Query `staleTime` and `cacheTime` configuration for character queries is not specified. Defaults may cause unnecessary refetches

## Dependencies
- **Depends on:** Story 2.8 (Character, CharacterSummary types), Django REST API character endpoints (Epic 5 backend)
- **Blocks:** All Phase 2+ UI components that display or edit character data, Story 6.2 (wizard finalization uses character mutation)

## Notes
- React Query provides automatic caching, background refetching, and stale-while-revalidate behavior out of the box. This replaces all manual `loading`/`error` state management that a Zustand-only approach would require
- Zustand is minimal here — it holds only `activeCharacterId` as a UI pointer so components can know which character the user has selected without it being tied to a route parameter
- The API layer (`api/characters.ts`) should use a shared Axios instance configured with the base URL and Django session auth credentials (`withCredentials: true`)
- Consider adding `select` options to React Query hooks for data transformation (e.g., sorting characters by name or filtering by class)
- Cache invalidation strategy: mutations invalidate query keys rather than manually updating the cache. This is simpler and guarantees consistency with the server, at the cost of an extra fetch after each mutation
