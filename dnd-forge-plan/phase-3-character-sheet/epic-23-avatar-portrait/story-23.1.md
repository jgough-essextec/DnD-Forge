# Story 23.1 — Avatar Upload & Storage

> **Epic 23: Character Avatar / Portrait System** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need to upload an image for my character's portrait and have it stored with the character data.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Image Upload (Gap S8)**: Accept JPEG and PNG files up to 2MB. Client-side processing only — no server upload
- **Image Processing**: Resize to maximum 400x400 pixels maintaining aspect ratio. Use HTML5 `canvas` API for resizing. Convert to JPEG at 80% quality to minimize storage
- **Storage**: Base64 data URL string stored in the character's `avatar` field in IndexedDB
- **Crop Interface**: Simple CSS-based square crop with drag-to-position. No heavy library needed
- **Default Avatar**: If no avatar uploaded, generate a placeholder based on race (silhouette icon) with class-themed color background
- **Upload Triggers**: Character sheet portrait area (edit mode) and gallery card edit action

## Tasks
- [ ] **T23.1.1** — Create `components/character/AvatarUploader.tsx` — an upload dialog triggered from the character sheet's portrait area (edit mode) or the gallery card edit action. Accept JPEG and PNG files up to 2MB
- [ ] **T23.1.2** — Implement client-side image processing: resize the uploaded image to a maximum of 400x400 pixels while maintaining aspect ratio. Use `canvas` API for resizing. Convert to JPEG at 80% quality to minimize storage. Store the result as a base64 data URL string in the character's `avatar` field
- [ ] **T23.1.3** — Create `components/character/AvatarCropper.tsx` — after uploading, show a crop interface where the player can select a square region of the image. Use simple CSS-based crop with drag-to-position (no heavy library needed). "Confirm" saves the cropped image
- [ ] **T23.1.4** — "Remove Avatar" button that clears the `avatar` field and reverts to the default placeholder
- [ ] **T23.1.5** — Default avatar generation: if no avatar is uploaded, generate a placeholder based on race and class. Use a simple icon-based system: race silhouette icon (Elf, Dwarf, Human, etc.) with a class-themed color background (red for Fighter, blue for Wizard, green for Ranger, etc.)

## Acceptance Criteria
- Avatar upload dialog accepts JPEG and PNG files up to 2MB
- Files larger than 2MB are rejected with a clear error message
- Non-image files are rejected with a clear error message
- Uploaded images are resized to max 400x400 pixels maintaining aspect ratio
- Images are converted to JPEG at 80% quality
- Processed image is stored as base64 data URL in the character's avatar field
- Crop interface allows selecting a square region of the uploaded image
- "Confirm" in the cropper saves the cropped image
- "Remove Avatar" button clears the avatar and shows the default placeholder
- Default avatar shows a race-based silhouette icon with class-themed color background
- Upload is triggered from the character sheet portrait area and gallery card edit action

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should validate accepted file types (JPEG, PNG only)`
- `should reject files exceeding 2MB size limit`
- `should reject non-image file types with clear error message`
- `should resize image to max 400x400 pixels maintaining aspect ratio`
- `should convert image to JPEG at 80% quality`
- `should generate base64 data URL string from processed image`
- `should generate default avatar based on race silhouette and class color`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render upload dialog accepting JPEG and PNG files`
- `should display clear error message when file exceeds 2MB`
- `should display clear error message for non-image files`
- `should show crop interface after uploading with drag-to-position square selection`
- `should save cropped image when "Confirm" is clicked in cropper`
- `should clear avatar and show default placeholder when "Remove Avatar" is clicked`
- `should display default avatar with race silhouette icon and class-themed color background`
- `should trigger upload dialog from character sheet portrait area in edit mode`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should upload an image, crop it, confirm, and see the avatar display on the character sheet and gallery card`

### Test Dependencies
- Mock image files (valid JPEG, valid PNG, oversized, wrong type)
- Mock canvas API for image processing
- Mock IndexedDB for avatar storage
- Mock view/edit mode context

## Identified Gaps

- **Error Handling**: No specification for canvas API failure during image processing (corrupt image data)
- **Accessibility**: No ARIA labels for upload dialog, no keyboard support for crop interface, no screen reader support for crop region selection
- **Performance**: No specification for image processing time limits (large images may take time to resize)
- **Mobile/Responsive**: No specification for touch-based crop interaction on mobile

## Dependencies
- Phase 1 Character type system (avatar field on Character model)
- Phase 1 IndexedDB database layer for storing avatar data
- Epic 20 (View/Edit Mode) — upload is available in edit mode

## Notes
- Base64 storage in IndexedDB is simple but can be large (~50-100KB per image after processing). This is acceptable for a local-first app
- The crop interface should be lightweight — no need for a library like react-cropper. CSS transforms and mouse/touch events are sufficient
- Default avatars provide visual differentiation in the gallery even before players upload images
- Class color scheme: Fighter (red), Wizard (blue), Rogue (dark gray), Cleric (gold), Ranger (green), Paladin (silver), Barbarian (orange), Bard (purple), Druid (brown), Monk (teal), Sorcerer (crimson), Warlock (dark purple)
- Race silhouettes: Human (generic), Elf (pointed ears), Dwarf (shorter, bearded), Halfling (small), etc.
