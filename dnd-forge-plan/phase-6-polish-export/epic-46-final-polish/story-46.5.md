# Story 46.5 — Manual Override System

> **Epic 46: Final Polish & UX Refinements** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a player with homebrew modifications, I need to manually override computed values while still seeing what the calculated value would be. This story implements the override indicator (visual icon on overridden fields), the dual-storage system (override value alongside computed value), a "Reset to Computed" action, and override persistence through level-ups with change notifications.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Deferred From**: Phase 3 Open Question OQ1 — Manual Override vs. Computed Values
- **Overridable Fields**: AC, initiative, skill modifiers, saving throw modifiers, speed, hit points, spell save DC, spell attack bonus — any normally-computed field
- **Override Indicator**: Small icon (broken chain link or pen icon) on overridden fields. Tooltip shows computed value and reset option
- **Storage**: Both override value and computed value stored in character data. Display shows override when present, computed otherwise
- **Level-Up Behavior**: Overrides survive level-ups, but if the computed value changes, a notification alerts the player to review

## Tasks

- [ ] **T46.5.1** — **Override indicator:** any field that is manually overridden shows a small "override" icon (a broken chain link or a pen icon). Tooltip: "This value is manually set. Calculated value: [N]. Click to reset."
- [ ] **T46.5.2** — **Override system:** when a player edits a normally-computed field (AC, initiative, skill modifier, etc.) in edit mode, store both the override value and the computed value. Display the override. Recalculation still runs but doesn't overwrite the override
- [ ] **T46.5.3** — **"Reset to Computed" action:** clicking the override indicator resets the field to the calculated value and removes the override flag
- [ ] **T46.5.4** — **Override persistence:** overrides survive level-ups and other changes. But if the computed value changes (e.g., ability score increases), show a notification: "[Field] has a manual override of [X], but the calculated value changed to [Y]. Would you like to update?"

## Acceptance Criteria

- Fields with manual overrides display a visible "override" icon (broken chain link or pen icon)
- Override icon tooltip shows: "This value is manually set. Calculated value: [N]. Click to reset."
- Editing a computed field in edit mode stores both the override value and the computed value
- The override value is displayed instead of the computed value when an override exists
- The calculation engine continues to run and update the computed value even when overridden
- "Reset to Computed" action (clicking the override icon) removes the override and restores the computed value
- Overrides persist through level-ups and other character changes
- When a computed value changes (e.g., after ability score increase), a notification appears: "[Field] has a manual override of [X], but the calculated value changed to [Y]. Would you like to update?"
- Override data is persisted via API as part of the character model
- Overrides are included in character export (JSON) and preserved on import
- PDF export displays override values (not computed) for overridden fields

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should store both override value and computed value in character data Map structure`
- `should use consistent naming convention for override field keys (e.g., "ac", "initiative", "skill.athletics", "save.strength")`
- `should display override value when present, computed value otherwise`
- `should continue running calculation engine without overwriting override values`
- `should remove override flag and restore computed value on "Reset to Computed" action`
- `should detect computed value changes after level-up and generate change notification`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should display override icon (broken chain link or pen) on manually overridden fields`
- `should show tooltip "This value is manually set. Calculated value: [N]. Click to reset." on override icon`
- `should reset field to computed value when override indicator is clicked`
- `should show notification "[Field] has a manual override of [X], but the calculated value changed to [Y]" after level-up`
- `should persist overrides via API as part of character model`
- `should include overrides in character JSON export and preserve on import`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should override AC in edit mode, display override icon, and show computed value in tooltip`
- `should persist override through level-up and show change notification when computed value changes`
- `should export character with overrides as JSON, import, and verify overrides are preserved`
- `should display override values (not computed) in PDF export for overridden fields`

### Test Dependencies
- Character fixture with overridable fields (AC, initiative, skill modifiers, saving throws)
- Edit mode toggle for override editing
- Level-up flow trigger for override persistence testing
- Character export/import functions for round-trip testing
- PDF export verification for override display

## Identified Gaps

- **Edge Cases**: No specification for maximum number of simultaneous overrides per character
- **Edge Cases**: "View All Overrides" summary mentioned in notes but not in acceptance criteria
- **Accessibility**: Override icon needs ARIA label and keyboard accessibility — not specified
- **Mobile/Responsive**: Override icon and tooltip behavior on mobile (touch vs hover) not specified

## Dependencies

- Phase 3 character sheet edit mode (override editing happens in edit mode)
- Phase 3 calculation engine (computed values that can be overridden)
- Phase 4 level-up flow (override persistence and change notifications)

## Notes

- The override system should use a `Map<string, { override: number; computed: number }>` or similar structure on the character model
- Override field keys should use a consistent naming convention (e.g., `"ac"`, `"initiative"`, `"skill.athletics"`, `"save.strength"`)
- The "Would you like to update?" notification after computed value changes should be dismissable — the player may intentionally want to keep the override
- Consider adding a "View All Overrides" summary in the character sheet that lists all manually overridden fields for easy review
- This feature is important for homebrew campaigns where DMs may grant custom bonuses or items that the calculation engine doesn't account for
