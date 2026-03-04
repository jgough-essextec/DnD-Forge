# Story 39.6 — Campaign Export to PDF

> **Epic 39: PDF Character Sheet Export** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a DM, I need to export a campaign summary PDF showing all party members' key stats. This includes a party overview page with a summary table of all characters' key stats (useful as a DM quick-reference printout), one-page-per-character condensed summaries, and an option to include full three-page character sheets for a comprehensive campaign binder.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router, jsPDF (PDF export), Playwright (E2E testing)
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **Campaign Data**: Campaign model from Phase 5 with party members, session notes, NPCs, loot
- **Party Stats Grid**: Existing component from Phase 5 campaign dashboard showing all characters' key stats
- **PDF Output**: Single PDF document with campaign name, party overview table, and per-character summaries
- **Condensed Character View**: Name, race, class, level, ability scores, AC, HP, key features, spell save DC — one page per character

## Tasks

- [ ] **T39.6.1** — "Export Party Summary" option on the campaign dashboard. Generates a single PDF with: campaign name, description, and a one-page-per-character summary (condensed: name, race, class, level, ability scores, AC, HP, key features, spell save DC)
- [ ] **T39.6.2** — **Party overview page:** first page of the campaign PDF is a summary table showing all characters' key stats (same data as the party stats grid). Useful as a DM quick-reference printout
- [ ] **T39.6.3** — Option to include full character sheets (3 pages each) after the summary, creating a comprehensive campaign binder PDF

## Acceptance Criteria

- "Export Party Summary" option is available on the campaign dashboard
- Generated PDF includes campaign name and description on the first page
- Party overview page contains a summary table with all characters' key stats matching the party stats grid
- Each character has a one-page condensed summary with name, race, class, level, ability scores, AC, HP, key features, and spell save DC
- Option to include full three-page character sheets after the summaries works correctly
- Campaign binder PDF (with full sheets) generates correctly for parties of 4-8 characters
- PDF downloads with a descriptive filename (e.g., `[CampaignName]_Party_Summary.pdf`)

## Dependencies

- Stories 39.1-39.4 (PDF generation architecture and all three page layouts for full sheet option)
- Story 39.5 (PDF export infrastructure — progress indicator, error handling)
- Phase 5 campaign data model and party stats grid component

## Notes

- The campaign binder option can produce large PDFs (8 characters x 3 pages = 24 pages + overview). Show clear progress indication
- The condensed one-page character view should prioritize the most DM-useful information (combat stats, key features, spell save DC)
- Consider adding NPC stat blocks as an optional section in the campaign PDF (future enhancement)
