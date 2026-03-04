# Story 18.1 — Appearance & Description Section

> **Epic 18: Character Sheet — Page 2 (Backstory & Details)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to see my character's physical description fields and appearance notes.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Page 2 Layout**: Two-column layout on desktop. Left column (~35%): portrait, appearance notes, allies & organizations. Right column (~65%): backstory, additional features, treasure. Equipment and currency span full width at bottom
- **Top Banner**: Duplicates character name from Page 1, plus physical detail fields in a horizontal strip (age, height, weight, eyes, skin, hair)
- **Portrait Area**: Large avatar display (~200px) in the left column with appearance notes below. Uses the avatar system from Epic 23
- **Allies & Organizations**: Text block below the portrait for faction/alliance information
- **Physical Detail Fields**: Accept any text (not validated) — players describe height as "5'10\"" or "tall"

## Tasks
- [ ] **T18.1.1** — Create `components/character/page2/BackstoryPage.tsx` as the Page 2 container. Two-column layout: narrow left column for appearance/allies, wide right column for backstory/features/treasure
- [ ] **T18.1.2** — Create `components/character/page2/AppearanceBanner.tsx` — top row showing character name (duplicate from Page 1) and physical detail fields in a horizontal strip: Age, Height, Weight, Eyes, Skin, Hair. Each is a compact field with label above
- [ ] **T18.1.3** — Create `components/character/page2/CharacterPortrait.tsx` — in the left column, a large portrait area (placeholder if no image uploaded). Shows the character avatar at a larger size (~200px). Below it, the "Appearance Notes" text area for freeform description of distinguishing features
- [ ] **T18.1.4** — **Edit mode:** all appearance fields become editable text inputs. The portrait area shows an "Upload Image" button overlaying the placeholder/image. Physical detail fields accept any text (not validated — players describe height as "5'10\"" or "tall")
- [ ] **T18.1.5** — Create `components/character/page2/AlliesOrgs.tsx` — below the portrait, a text block for allies & organizations. Shows faction logos or text descriptions. **Edit mode:** freeform textarea

## Acceptance Criteria
- Page 2 container renders a two-column layout (narrow left, wide right)
- Top banner shows character name and physical detail fields (Age, Height, Weight, Eyes, Skin, Hair)
- Physical detail fields display with labels above values
- Portrait area shows the character avatar at ~200px or a placeholder
- Appearance Notes text area displays below the portrait
- Allies & Organizations text block renders below the portrait section
- Edit mode makes all appearance fields editable text inputs
- Edit mode shows an "Upload Image" button on the portrait area
- Physical detail fields accept any freeform text without validation

## Dependencies
- Epic 23 (Avatar/Portrait System) for portrait display and upload
- Epic 20 view/edit mode toggle system
- Phase 2 character data in IndexedDB (appearance fields from creation wizard)

## Notes
- Physical detail fields may be empty for characters created without filling in appearance details — display graceful empty states
- The portrait area is a key visual anchor for the page — the placeholder should be visually appealing
- Allies & Organizations is often empty for new characters — show placeholder text
